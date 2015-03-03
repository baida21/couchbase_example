var couchbase = require("couchbase");
var couchbase = require("couchbase");

//Connect to Couchbase Server

var cluster = new couchbase.Cluster('127.0.0.1:8091');
var bucket = cluster.openBucket('example_bucket', function(err) {
  if (err) {
    // Failed to make a connection to the Couchbase cluster.
    console.log("openBucket ERROR :");
    throw err;
  }
});



exports.addUser = function(req, res) {			
};


exports.findUser = function(req, res) {
};

exports.findUsersAll = function(req, res) {			
};


exports.updateUser = function(req, res) {	
};

exports.deleteUser = function(req, res) {	
};
