var couchbase = require("couchbase");

//Connect to Couchbase Server

//var cluster = new couchbase.Cluster('127.0.0.1:8091');
//var cluster = new couchbase.Cluster({"host": "127.0.0.1:8091", "queryhosts":"127.0.0.1:8093"});
//var ViewQuery = couchbase.ViewQuery;
//var n1qlQuery = require('couchbase').N1qlQuery;


//var bucket = cluster.openBucket('example_bucket', function(err) {
//if (err) {
//// Failed to make a connection to the Couchbase cluster.
//console.log("openBucket ERROR :");
//throw err;
//}

//console.log("Couchbase open the bucket !....");
//});

//var defaultConnection = {
//"host": "127.0.0.1:8091"
//"bucket": "default",
//"operationTimeout":5000,
//"queryhosts":"127.0.0.1:8093"
//};

//exports.findUserByN1Query = function(req, res) { 
//var couchbase = require('couchbase');

//var client = new couchbase.Connection ( {
//'bucket' : 'default',
//'host' : '127.0.0.1:8091',
//'queryhosts' : 'localhost:8093'
//});

//client.query("select * from beer-example", function(err, result) {
//console.log(result);
//});
//};


exports.findUserByN1Query = function(req, res) {
  var myCluster = new couchbase.Cluster();  
  var N1qlQuery = require('couchbase').N1qlQuery;
  var myBucket = myCluster.openBucket();

  var query = N1qlQuery.fromString('SELECT * FROM beer-sample');
  myBucket.enableN1ql('http://localhost:8093');

  myBucket.query(query, function(err, results) {
    if (err) {
      console.log("findUserByN1Query ERROR ", err);
//    var message = [{"result":"ERROR", "error_content":""+err+""}];
//    res.writeHead(200, { 'Content-Type': 'application/json' });
//    res.write(JSON.stringify(message));
//    res.end();
      return;
    }

    //var doc = results.value;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(results));
    res.end();

    console.log('findUserByN1Query SUCCESS', results);

  });

};