var couchbase = require("couchbase");

//Connect to Couchbase Server

var cluster = new couchbase.Cluster('127.0.0.1:8091');
var ViewQuery = couchbase.ViewQuery;

var bucket = cluster.openBucket('example_bucket', function(err) {
  if (err) {
    console.log("openBucket ERROR :");
    throw err;
  }	
  console.log("Couchbase open the example_bucket bucket !....");
});

var bucket2 = cluster.openBucket('beer-sample', function(err) {
  if (err) {
    console.log("openBucket ERROR :");
    throw err;
  }

  console.log("Couchbase open the beer-sample bucket !....");
});


exports.addUser = function(req, res) {

  console.log('addUser : ', JSON.stringify(req.body));
  var content = req.body;
  var doc = JSON.parse(JSON.stringify(content));

  var user_id = doc.user_id;
  console.log('addUser user_id = ', user_id);

  bucket.insert(user_id, doc, function(err, result) {
    if (err) { 
      console.log("addUser ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }

    var message = [{"result":"OK", "error_content":""}];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(message));
    res.end();

    console.log('addUser SUCCESS', result);

  });					
};

exports.addUserSecure = function(req, res) {

  console.log('addUserSecure : ', JSON.stringify(req.body));
  var content = req.body;
  var doc = JSON.parse(JSON.stringify(content));

  var user_id = doc.user_id;
  console.log('addUserSecure user_id = ', user_id);

  bucket.insert(user_id, doc, {persist_to:1, replicate_to:1}, function(err, result) {
    if (err) { 
      console.log("addUserSecure ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }

    var message = [{"result":"OK", "error_content":""}];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(message));
    res.end();

    console.log('addUserSecure SUCCESS', result);
  });             
};


exports.findUser = function(req, res) {

  console.log('findUser : ', JSON.stringify(req.body));
  var content = req.body;
  var doc = JSON.parse(JSON.stringify(content));

  var user_id = req.params.id;	

  bucket.get(user_id, function(err, result) {
    if (err) {
      console.log("findUser ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }

    var doc = result.value;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(doc));
    res.end();
    console.log('findUser SUCCESS', doc);
    console.log('findUser SUCCESS', result);

  });
};

exports.findUserWithLock = function(req, res) {

  console.log('findUserWithLock : ', JSON.stringify(req.body));
  var content = req.body;
  var doc = JSON.parse(JSON.stringify(content));

  var user_id = req.params.id;  

  bucket.getAndLock(user_id, {lockTime : 15}, function(err, result) {
    if (err) {
      console.log("findUser ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }

    var doc = result.value;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(doc));
    res.end();
    console.log('findUserWithLock SUCCESS', doc);
    console.log('findUserWithLock SUCCESS', result);

  });
};

exports.findUserWithTouch = function(req, res) {

  console.log('findUserWithTouch : ', JSON.stringify(req.body));
  var content = req.body;
  var doc = JSON.parse(JSON.stringify(content));

  var user_id = req.params.id;  

  bucket.getAndTouch(user_id, 0, {persist_to:1, replica_to: 0}, function(err, result) {
    if (err) {
      console.log("findUser ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }

    var doc = result.value;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(doc));
    res.end();
    console.log('findUserWithTouch SUCCESS', doc);
    console.log('findUserWithTouch SUCCESS', result);

  });
};

exports.findUserWithReplica = function(req, res) {

  console.log('findUserWithReplica : ', JSON.stringify(req.body));
  var content = req.body;
  var doc = JSON.parse(JSON.stringify(content));

  var user_id = req.params.id;  

  bucket.get(user_id, function(err, result) {
    if (err && err.code == couchbase.errors.connectError) {

      bucket.getReplica(user_id, function(err, result) {
        if(err) {
          bucket.getReplica(user_id, 10, function(err, result) {});
        } else {
          var doc = result.value;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(JSON.stringify(doc));
          res.end();
          return;
        }
      });
    } else {
      var doc = result.value;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(doc));
      res.end();
      console.log('findUserWithReplica SUCCESS', doc);
    }        
  });          
};

exports.findUsersAll = function(req, res) {

  var query = ViewQuery.from('dev_example', 'user_list');
  bucket.query(query, function(err, results) {
    if (err) {
      console.log("findUsersAll ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }

    for(i in results) console.log(results[i]);

    //var doc = results.value;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(results));
    res.end();

    console.log('findUsersAll SUCCESS', results);

  });
};



exports.findUsersSelected = function(req, res) {

  console.log('findUsersSelected : ', JSON.stringify(req.body));
  var doc = JSON.parse(JSON.stringify(req.body));

  bucket.getMulti(doc, function(err, results) {
    if (err) {
      console.log("findUsersSelected ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }

    //var doc = results.value;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(results));
    res.end();
    console.log('findUsersSelected SUCCESS', results);
  });
};


exports.updateUser = function(req, res) {

  console.log('updateUser : ', JSON.stringify(req.body));
  var content = req.body;
  var doc = JSON.parse(JSON.stringify(content));

  var user_id = req.params.id;

  bucket.replace(user_id, doc, function(err, result) {
    if (err) {
      console.log("updateUser ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }


    var message = [{"result":"OK", "error_content":""}];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(message));
    res.end();

    console.log('updateUser SUCCESS', result);

  });
};

exports.updateUserTTL = function(req, res) {

  console.log('updateUserTTL : ', JSON.stringify(req.body));
  var content = req.body;
  var doc = JSON.parse(JSON.stringify(content));

  var user_id = req.params.id;

  bucket.touch(user_id, 3600, {persist_to:1, replica_to:1}, function(err, result) {
    if (err) {
      return;
    }

    var message = [{"result":"OK", "error_content":""}];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(message));
    res.end();

    console.log('updateUserTTL SUCCESS', result);

  }); 
};


exports.updateWithPersist = function(req, res) {

  var user_id = req.params.id;
  bucket2.get(user_id, function(err, result) {

    if(err) {
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;

    } else {
      var doc = result.value;
      bucket2.replace(user_id, doc, {persist_to:1, replicate_to:0}, function(err, result) {
        if (err) {
          var message = [{"result":"ERROR", "error_content":""+err+""}];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(JSON.stringify(message));
          res.end();
          return;
        }

        var message = [{"result":"OK", "error_content":""}];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(message));
        res.end();       
      });
    }
  }); 
};


exports.updateWithNoLock = function(req, res) {

  var user_id = req.params.id;
//console.log('updateWithNoLock user_id = ', user_id);  
  bucket2.get(user_id, function(err, result) {

    if(err) {
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;

    } else {
      var doc = result.value;
      bucket2.replace(user_id, doc, function(err, result) {
        if (err) {
          var message = [{"result":"ERROR", "error_content":""+err+""}];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(JSON.stringify(message));
          res.end();
          return;
        }

        var message = [{"result":"OK", "error_content":""}];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(message));
        res.end();       
      });
    }
  });
};


exports.updateWithReplicate = function(req, res) {

  var user_id = req.params.id;
//console.log('updateWithReplicate user_id = ', user_id);  
  bucket2.get(user_id, function(err, result) {

    if(err) {
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;

    } else {
      var doc = result.value;
      bucket2.replace(user_id, doc, {persist_to:1, replicate_to:1}, function(err, result) {
        if (err) {
          var message = [{"result":"ERROR", "error_content":""+err+""}];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(JSON.stringify(message));
          res.end();
          return;
        }

        var message = [{"result":"OK", "error_content":""}];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(message));
        res.end();      
      });
    }
  });
};


exports.exsitUserTTL = function(req, res) {

  console.log('exsitUserTTL : ', JSON.stringify(req.body));

  var user_id = req.params.id;

  bucket.touch(user_id, 0, function(err, result) {
    if (err) {
      if(err.code == couchbase.errors.keyNotFound) {
        console.log("exsitUserTTL ERROR ", err);
        var message = [{"result":"ERROR", "content" : "document is Not exist"}];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(message));
        res.end();
      }
      return;
    }

    var message = [{"result":"OK", "error_content":""}];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(message));
    res.end();

    console.log('exsitUserTTL SUCCESS', result);
  });

};

exports.deleteUser = function(req, res) {

  console.log('deleteUser : ', JSON.stringify(req.body));
  var content = req.body;
  var doc = JSON.parse(JSON.stringify(content));

  var user_id = req.params.id;

  bucket.remove(user_id, function(err, result) {
    if (err) {
      console.log("deleteUser ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }

    var message = [{"result":"OK", "error_content":""}];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(message));
    res.end();

    console.log('deleteUser SUCCESS', result);
  });	
};


exports.addUserBySeq = function(req, res) {

  console.log('addUserBySeq : ', JSON.stringify(req.body));
  var content = req.body;
  var doc = JSON.parse(JSON.stringify(content));

  var user_id = doc.user_id;
  console.log('addUserBySeq user_id = ', user_id);

  bucket.counter('bucket_seq', 1, {initial:1}, function(err, counter) {

    console.log('addUserBySeq counter', counter);
    bucket.insert(JSON.stringify(counter.value), doc, function(err, result) {
      if (err) { 
        console.log("addUserBySeq ERROR ", err);
        var message = [{"result":"ERROR", "error_content":""+err+""}];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(message));
        res.end();
        return;
      }

      var message = [{"result":"OK", "error_content":""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();

      console.log('addUserBySeq SUCCESS', result);
    });	
  });
};

exports.atomic = function(req, resp) {
  bucket.insert('12345', 'Name is', function() {
    // append는 insert는 조작 바로 다음에 실행된다.
    bucket.append('12345', 'Sean!', function() {
      // Prepend는 insert 조작 직전에 실행된다.
      bucket.prepend('12345', 'My ', function() {
        // 먼저 12345에 대해 값을 가져온다. 여기서는 해당 데이터가 없으므로 null이 리턴된다.
        bucket.get('12345', function(err, res) {
          resp.writeHead(200, { 'Content-Type': 'application/json' });
          resp.write(JSON.stringify(res));
          resp.end();
          console.log(err, res);
        });
      });
    });
  });
}


exports.addView = function(req, res) {

  console.log("addView started... ");

  var beer_by_name = {
      map : [ 'function(doc, meta) {',
              'if (doc.type && doc.type == "beer") { ',
              'emit(doc.name, null); }',
              '}'
              ].join('\n')
  }

  var bmanager = bucket2.manager();

  bmanager.getDesignDocument( "dev_beer", function( err, ddoc, meta ) {

    if(err)  console.log("addView ERROR ", err);
    if(! ('by_name' in ddoc['views']) ) {

      console.log("addView by_name not exist ");

      ddoc.views.by_name = beer_by_name;
      bmanager.upsertDesignDocument( "dev_beer", ddoc, function( err, result ) {
        if(err) {
          console.log("addView ERROR ", err);
          var message = [{"result":"ERROR", "error_content":""+err+""}];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(JSON.stringify(message));
          res.end();
          return;

        } else if (result.ok) {
          var message = [{"result":"OK", "content":"Updated!"}];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(JSON.stringify(message));
          res.end();
          return;
        }

        var message = [{"result":"OK", "content":"Created!"}];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(message));
        res.end()

      });
    } else {
      var message = [{"result":"OK", "content":"Already exist.!"}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
    }
  });

};

exports.getViewByKey = function(req, res) {

  var query = ViewQuery.from('dev_beer', 'get_brewery');

  query.keys(["August Schell Brewing", "Hofmark Brauerei"]).limit(5);
  bucket2.query(query, function(err, results) {
    if (err) {
      console.log("getViewByKey ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }

    //for(i in results) console.log(results[i]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(results));
    res.end();

    console.log('getViewByKey SUCCESS', results);
  });           
};

exports.getViewByRange = function(req, res) {

  var query = ViewQuery.from('dev_beer', 'get_brewery');

  query.range("2010-07-22", "2012-07-22").limit(5).order(ViewQuery.Order.ASCENDING);

  bucket2.query(query, function(err, results) {
    if (err) {
      console.log("getViewByRange ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }

    //for(i in results) console.log(results[i]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(results));
    res.end();

    console.log('getViewByRange SUCCESS', results);

  });           
};

exports.getViewByPage = function(req, res) {

  var query = ViewQuery.from('dev_beer', 'get_brewery');

  query.range("2010-07-22", "2012-07-22").limit(5).skip(10).order(ViewQuery.Order.ASCENDING);

  bucket2.query(query, function(err, results) {
    if (err) {
      console.log("getViewByPage ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }

    //var doc = results.value;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(results));
    res.end();

    console.log('getViewByPage SUCCESS', results);

  });           
};


exports.getViewByReduce = function(req, res) {

  var query = ViewQuery.from('dev_beer', 'get_brewery');

  query.range("2010-07-22", "2012-07-22");
  query.reduce(true);

  bucket2.query(query, function(err, results) {
    if (err) {
      console.log("getViewByReduce ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }
    //var doc = results.value;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(results));
    res.end();

    console.log('getViewByReduce SUCCESS', results);

  });           
};

exports.getViewByReduceKey = function(req, res) {

  var query = ViewQuery.from('dev_beer', 'get_brewery');

  query.key("Bayern");
  query.reduce(true);

  bucket2.query(query, function(err, results) {
    if (err) {
      console.log("getViewByReduce ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }

    //var doc = results.value;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(results));
    res.end();

    console.log('getViewByReduce SUCCESS', results);

  });           
};

exports.getViewByGroup = function(req, res) {

  //ViewQuery.group(1);
  var query = ViewQuery.from('dev_beer', 'get_brewery');

  query.key("7");
  query.group(1);
  query.reduce(true);

  bucket2.query(query, function(err, results) {
    if (err) {
      console.log("getViewByGroup ERROR ", err);
      var message = [{"result":"ERROR", "error_content":""+err+""}];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(message));
      res.end();
      return;
    }     
    //var doc = results.value;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(results));
    res.end();

    console.log('getViewByGroup SUCCESS', results);

  });           
};





