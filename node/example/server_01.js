var express    = require('express');
var bodyParser = require('body-parser');
var app = express()


app.use(bodyParser.json());

app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});


var cbHelper = require('./routes/CBHelper_01');
app.post('/post', cbHelper.add);

app.listen(3000);
console.log('Listening on port 3000...');