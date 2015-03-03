var couchbase = require("couchbase");
var serialize = require("node-serialize");

//Connect to Couchbase Server

var cluster = new couchbase.Cluster('127.0.0.1:8091');
var ViewQuery = couchbase.ViewQuery;
var n1QL = require('couchbase').N1qlQuery;

var bucket = cluster.openBucket('example_bucket', function(err) {
  if (err) {
    // Failed to make a connection to the Couchbase cluster.
    console.log("openBucket ERROR :");
    throw err;
  }

  console.log("Couchbase open the bucket !....");
});

//account { account_id, amount, transactionList : []} ;
exports.addAccount = function(req, res) {

  console.log('addAccount : ', JSON.stringify(req.body));
  var content = req.body;
  var doc = JSON.parse(JSON.stringify(content));

  var account_id = doc.account_id;
  console.log('addAccount account_id = ', account_id);

  bucket.insert(account_id, doc, function(err, result) {
    if (err) {
      console.log("addAccount ERROR ", err);
      var message = [ {
        "result" : "ERROR",
        "error_content" : "" + err + ""
      } ];
      res.writeHead(200, {
        'Content-Type' : 'application/json'
      });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }

    var message = [ {
      "result" : "OK",
      "error_content" : ""
    } ];
    res.writeHead(200, {
      'Content-Type' : 'application/json'
    });
    res.write(JSON.stringify(message));
    res.end();

    console.log('addAccount SUCCESS', result);

  })
};

exports.transaction = function(req, res) {

  console.log('transaction : ', JSON.stringify(req.body));

  var content = req.body;
  var doc = JSON.parse(JSON.stringify(content));

  var account_from = doc.account_from;
  var account_to = doc.account_to;
  var money = doc.money;

  sendMoneyTransaction(account_from, account_to, money, res);

};

var MAX_RETRY = 10;

function sendMoneyTransaction(from, to, money, res) {
  var transactionRef = {
      id : "",
      from : from,
      to : to,
      amount : money,
      state : "init",
      retry : 0
  };

  try {
    bucket.counter('transaction_id', 1, {initial : 1}, function(err, counter) {
      if (err) throw error;
      var tx_id = counter.value;

      transactionRef.id = tx_id;

      bucket.insert("transaction_" + tx_id, transactionRef, function(err,result) {
        if (err) throw err;
        updateTransactionState(transactionRef, "pending", updateFrom, res);
      })

    });

  } catch (err) {
    errorHandler(transactionRef, err, res);
  }
}

function updateTransactionState(txRef, state, nextStep, res) {
  // console.log("transaction state = ", state , " res = ", res);

  try {
    bucket.get('transaction_' + txRef.id, function(err, result) {

      if (err) throw err;

      var transactionRef = result.value;
      transactionRef.state = state;

      bucket.replace('transaction_' + txRef.id, transactionRef, function(err, result) {
        if (err) {
          transactionRef.retry += 1;
          if (err.code == couchbase.errors.keyAlreadyExist
              && txRef.retry <= MAX_RETRY)
            return updateTransactionState(txRef, state, nextStep, res);
          if (err.code == couchbase.errors.keyAlreadyExist
              && txRef.retry > MAX_RETRY)
            throw err;
        }

        nextStep(transactionRef, res); // 다음 스텝의 메쏘드로 트랜젝션 Ref를 넘긴다.
      });

    });

  } catch (err) {
    errorHandler(transactionRef, err, res);
  }

}

function updateFrom(txRef, res) {
  var key = txRef.from;
  try {
    var err = "init state error";
    throw err;

    bucket.get(key, function(err, result) {
      if (err)throw err;

      var account = result.value;
      account.amount -= txRef.amount;
      account.transactionList.push(txRef.id);

      bucket.replace(txRef.from, account, function(err, result) {
        if (err) {
          txRef.retry += 1;
          if (err.code == couchbase.errors.keyAlreadyExist
              && txRef.retry <= MAX_RETRY)
            return updateFrom(txRef, res);
          if (err.code == couchbase.errors.keyAlreadyExist
              && txRef.retry > MAX_RETRY)
            throw err;
        }

        updateTo(txRef, res); // 다음 스텝의 메쏘드로 트랜젝션 Ref를 넘긴다.
      });

    });
  } catch (err) {
    errorHandler(txRef, err, res);
  }
}

function updateTo(txRef, res) {

  try {
    bucket.get(txRef.to, function(err, result) {
      if (err) throw err;
      var account = result.value;
      account.amount += txRef.amount;
      account.transactionList.push(txRef.id);

      bucket.replace(txRef.to, account, function(err, result) {
        if (err) {
          txRef.retry += 1;
          if (err.code == couchbase.errors.keyAlreadyExist
              && txRef.retry <= MAX_RETRY)
            return updateTo(txRef, res);
          if (err.code == couchbase.errors.keyAlreadyExist
              && txRef.retry > MAX_RETRY)
            throw err;
          ;
        }
        updateTransactionState(txRef, "committed", cleanFrom, res);
      });

    });
  } catch (err) {
    errorHandler(txRef, err, res);
  }
}


function cleanFrom(txRef, res) {
  try {
    bucket.get(txRef.from, function(err, result) {
      if (err)throw err;

      var account = result.value;
      // account문서의 트랜젝션 참조 문서 아이디를 제거한다.
      account.transactionList.splice(account.transactionList.indexOf(txRef.id), 1);

      bucket.replace(txRef.from, account, function(err, result) {
        if (err) {
          txRef.retry += 1;
          if (err.code == couchbase.errors.keyAlreadyExist
              && txRef.retry <= MAX_RETRY)
            return cleanFrom(txRef, res);
          if (err.code == couchbase.errors.keyAlreadyExist
              && txRef.retry > MAX_RETRY)
            throw err;
        }
        cleanTo(txRef, res);
      });

    });
  } catch (err) {
    errorHandler(txRef, err, res);
  }
}

function cleanTo(txRef, res) {
  try {

    bucket.get(txRef.to, function(err, result) {
      if (err) throw err;

      var account = result.value;

      account.transactionList.splice(account.transactionList.indexOf(txRef.id), 1);

      bucket.replace(txRef.to, account, function(err, result) {
        if (err) {
          txRef.retry += 1;
          if (err.code == couchbase.errors.keyAlreadyExist
              && txRef.retry <= MAX_RETRY)
            return cleanTo(txRef, res);
          if (err.code == couchbase.errors.keyAlreadyExist
              && txRef.retry > MAX_RETRY)
            throw err;
          ;
        }

        updateTransactionState(txRef, "done", successTransaction, res);
      });

    });

  } catch (err) {
    errorHandler(txRef, err, res);
  }
}

function rollbackTransaction(txRef, res) {
  console.log("롤백 시작.. transaction id :" + txRef.id);

  bucket.get('transaction_' + txRef.id,function(err, result) {
    if (err) throw error;

    var transactionRef = result.value;
    console.log("롤백 진행 ... transaction.state ="+ transactionRef.state);

    switch (transactionRef.state) {
    case "init":
      updateTransactionState(transactionRef, "cancelled",function() {
        console.log("init 상태 롤백");
      });
      break;
    case "pending":
      updateTransactionState(transactionRef, "cancelling",rollbackFrom, res);
      break;

    case "committed":
      sendMoneyTransaction(transactionRef.to, transactionRef.from, transactionRef.amount, res);
      updateTransactionState(transactionRef, "cancelled",rollbackFrom, res);
      break;
    default:
      // 이 이외의 상황에서는 별도의 처리를 하지 않는다.
      console.log("이 단계에서는 별도의 처리가 필요하지 않다 state =", transactionRef.state);
    break;
    }
  });
}

function rollbackFrom(txRef, res) {
  bucket.get(txRef.from, function(err, result) {
    if (err) throw err;

    var account = result.value;
    if (account.transactionList.indexOf(txRef.id) == -1) {
      console.log("원 계좌에 트랜젝션 정보 없음.");
      return rollbackTo(txRef, res); // 대상 계좌에 대한 롤백 처리 진
    }

    account.balance += txRef.amount;
    account.transactionList.splice(account.transactionList.indexOf(txRef.id),1);

    bucket.replace(txRef.from, account, function(err, result) {
      if (err) {
        txRef.retry += 1;
        if (err.code == couchbase.errors.keyAlreadyExist
            && txRef.retry <= MAX_RETRY)
          return rollbackFrom(txRef, res);
        throw error;
      }

      rollbackTo(txRef, res);
    });

  });
}

function rollbackTo(txRef, res) {
  bucket.get(txRef.from, function(err, result) {
    if (err) throw err;

    var account = result.value;
    if (account.transactionList.indexOf(txRef.id) == -1) {
      console.log("원 계좌에 트랜젝션 정보 없음.");
      return finalizeRollBackTransactionStep(txRef, res); 
    }

    account.balance -= txRef.amount;
    account.transactionList.splice(account.transactionList.indexOf(txRef.id), 1);

    bucket.replace(txRef.to, account, function(err, result) {
      if (err) {
        txRef.retry += 1;
        if (err.code == couchbase.errors.keyAlreadyExist
            && txRef.retry <= MAX_RETRY)
          return rollbackTo(txRef, res);
        throw error;
      }

      finalizeRollBackTransactionStep(txRef, res);
    });

  });
}



function finalizeRollBackTransactionStep(txRef, res) {
  updateTransactionState(txRef, "cancelled", successRollbackTransaction, res);
}

function successTransaction(txRef, res) {
  console.log("Transaction completed sucessfully!");
  var message = [ {"result" : "Transaction Completed",
    "error_content" : ""} ];

  res.writeHead(200, {
    'Content-Type' : 'application/json'
  });

  res.write(JSON.stringify(message));
  res.end();
}

function successRollbackTransaction(txRef, res) {
  console.log("Rollback transaction completed sucessfully!");
  var message = [ {"result" : "ERROR",
    "rollback completed" : "" } ];

  res.writeHead(200, {
    'Content-Type' : 'application/json'
  });

  res.write(JSON.stringify(message));
  res.end();
}



function errorHandler(txRef, err, res) {
  rollbackTransaction(txRef, res);
  console.log("에러 발생 = ", err);
}
