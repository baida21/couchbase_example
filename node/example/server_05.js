var express    = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json({limit: '50mb'}));

app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});


var cbHelper = require('./routes/CBHelper_05');

app.get('/n1query', cbHelper.findUserByN1Query);

app.listen(3000);
console.log('Listening on port 3000...');