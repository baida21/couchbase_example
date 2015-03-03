var express    = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json({limit: '50mb'}));

app.use(function(req, res, next){
  next();
});


var cbHelper = require('./routes/CBHelper_03');

app.post('/users', cbHelper.addUser);
app.get('/users/:id', cbHelper.findUser);
app.get('/users/lock/:id', cbHelper.findUserWithLock);
app.get('/users/touch/:id', cbHelper.findUserWithTouch);
app.get('/users/quickcheck/:id', cbHelper.exsitUserTTL);
app.get('/users/', cbHelper.findUsersAll);
app.get('/users/update/persist/:id', cbHelper.updateWithPersist);
app.get('/users/update/nolock/:id', cbHelper.updateWithNoLock);
app.get('/users/update/replicate/:id', cbHelper.updateWithReplicate);
app.put('/users/:id', cbHelper.updateUser);
app.put('/users/ttl/:id', cbHelper.updateUserTTL);
app.delete('/users/:id', cbHelper.deleteUser);
app.post('/users/selected', cbHelper.findUsersSelected);
app.post('/users/sequence', cbHelper.addUserBySeq);
app.post('/users/secure', cbHelper.addUserSecure);
app.get('/atomic', cbHelper.atomic);

app.post('/views/create', cbHelper.addView);
app.get('/views/key', cbHelper.getViewByKey);
app.get('/views/range', cbHelper.getViewByRange);
app.get('/views/page', cbHelper.getViewByPage);
app.get('/views/reduce', cbHelper.getViewByReduce);
app.get('/views/reducekey', cbHelper.getViewByReduceKey);
app.get('/views/group', cbHelper.getViewByGroup);



app.listen(3000);
console.log('Listening on port 3000...');