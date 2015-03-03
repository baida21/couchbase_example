var couchbase = require("couchbase");

//Connect to Couchbase Server

var cluster = new couchbase.Cluster('127.0.0.1:8091');
var bucket = cluster.openBucket('default', function(err) {
  if (err) {
    // Failed to make a connection to the Couchbase cluster.
    throw err;
  }
});



exports.add = function(req, res) {
  var content = req.body;
  console.log('Adding db: ' + JSON.stringify(content));
  var doc = JSON.parse(JSON.stringify(content));
  var randNum = Math.floor(Math.random() * (99999-10000 +1) + 10000); // 10000~99999
  bucket.insert(randNum.toString(), doc, function(err, rs) {
    if (err) { 
      console("add error");
      res.writeHead(200, { 'Content-Type': 'application/json' });
      var result = [{"result":"ERROR", "error_content":""+err+""}];
      console.log("sendResult ERROR :" +JSON.stringify(result));
      res.write(JSON.stringify(result));
      res.end();
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    var result = [{"result":"OK", "error_content":""}];
    res.write(JSON.stringify(result));
    res.end();
  });

};
