/* Tom Hambleton */
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , myq = require('./myq')
  , http = require('http')
  , path = require('path');

var app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(allowCrossDomain);
  app.use(express.favicon());
  //app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  //app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.myq = myq.createMyQ();  
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//
// Routes
//
app.get('/', routes.index);

app.post('/RendezQ/do/message',function(req, res) {  // body has to, from, msg in JSON format
	app.myq.handleMsgPost(req, res); });

app.get('/RendezQ/do/message',function(req, res) {  // ?to=<user>&from=<user>&msg=<text>
	app.myq.handleMsgPut(req, res); });

app.get('/RendezQ/do/getMessage',function(req, res) { // ?user=<user> 
	app.myq.handleMsgGet(req, res); });

app.get('/RendezQ/do/addQueue',function(req, res) { // ?name=<user> 
	app.myq.handleAddQueue(req, res); });

app.get('/RendezQ/do/delQueue',function(req, res) { // ?name=<user> 
	app.myq.handleDelQueue(req, res); });

app.get('/RendezQ/do/flush',function(req, res) {  //?user=<user>
	app.myq.handleMsgGet(req, res); });

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
