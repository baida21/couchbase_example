var express    = require('express');
var bodyParser = require('body-parser');
var app = express()

app.use(bodyParser.json({limit: '50mb'}));

app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});


var cbHelper = require('./routes/CBHelper_02');

app.post('/users', cbHelper.addUser);
app.get('/users/:id', cbHelper.findUser);
app.get('/users/', cbHelper.findUsersAll);
app.put('/users/:id', cbHelper.updateUser);
app.delete('/users/:id', cbHelper.deleteUser);


app.listen(3000);
console.log('Listening on port 3000...');