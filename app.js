
/**
 * Module dependencies.
 */

require('newrelic');
var express = require('express');
var http = require('http');
var path = require('path');

var  mongoose = require('mongoose');
var  passport = require("passport");
var  flash = require("connect-flash");


var fs          = require('fs');
var connect = require('connect');
var routes = require('./lib/routes');

var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

mongoose.connect(config.db); 
require('./models/user');   
require('./lib/passport')(passport, config)

var app = express();
var sessionStore = new connect.session.MemoryStore();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
//app.use(express.limit('1mb'));
app.use(express.bodyParser());
//app.use(express.cookieParser('somesuperspecialsecrethere')); 
//app.use(express.session({ key: 'express.sid',
                     //store: sessionStore}));
app.use(express.session({ secret: 'superawesomeworldchangingsecret' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.methodOverride());
app.use(flash());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
//app.get('/contact', routes.contact);
//app.post('/mailsend', routes.mailwrite);

server = require('http').createServer(app);
routes.configRoutes( app, server, passport);
server.listen(app.get('port'));
console.log('Express server listening on 3000');

// Import the routes
/*fs.readdirSync('routes').forEach(function(file) {
  if ( file[0] == '.' ) return;
  var routeName = file.substr(0, file.indexOf('.'));
  require('./routes/' + routeName)(app, server, sessionStore);
}); */
