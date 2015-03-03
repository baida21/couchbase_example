var couchbase = require("couchbase");

var cluster = new couchbase.Cluster('127.0.0.1:8091');
var bucket = cluster.openBucket('beer-sample', function(err) {
  if (err) {
    throw err;
  }
});


exports.addUser = function(req, res) {
  var content = req.body;
  console.log('Adding db: ' + JSON.stringify(content));
  var doc = JSON.parse(JSON.stringify(content));
  var userId = doc.user_id

  bucket.insert('document_name', doc, function(err, res) {
    if (err) {
      console.log("add user error");
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