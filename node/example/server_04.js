var express    = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json({limit: '50mb'}));

app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

var cbHelper = require('./routes/CBHelper_04');

app.post('/accounts', cbHelper.addAccount);
app.post('/transaction', cbHelper.transaction);


process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

app.listen(3000);
console.log('Listening on port 3000...');