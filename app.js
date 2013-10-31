
/**
 * Module dependencies.
 */

require('newrelic');
var express = require('express');
var http = require('http');
var path = require('path');
var fs          = require('fs');
var connect = require('connect');
var routes = require('./routes/index.js');

var app = express();
var sessionStore = new connect.session.MemoryStore();

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.limit('1mb'));
app.use(express.bodyParser());
app.use(express.cookieParser('somesuperspecialsecrethere')); 
app.use(express.session({ key: 'express.sid',
                     store: sessionStore}));
app.use(express.methodOverride());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
//app.get('/contact', routes.contact);
//app.post('/mailsend', routes.mailwrite);

server = require('http').createServer(app);
io = require('socket.io').listen(server);
server.listen(app.get('port'));
console.log('Express server listening on 8080');

// Import the routes
fs.readdirSync('routes').forEach(function(file) {
  if ( file[0] == '.' ) return;
  var routeName = file.substr(0, file.indexOf('.'));
  require('./routes/' + routeName)(app, server, sessionStore);
});
