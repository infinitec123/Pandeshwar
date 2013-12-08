/*
 * routes.js - module to provide routing
*/

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------
var
  configRoutes, writeEMail, daeMon,
  chat        = require( './chat' ),
  Auth = require('./authorization');
  ;

// ------------- END MODULE SCOPE VARIABLES ---------------

//---------------- BEGIN Utility METHODS ------------------

writeEMail = function(name, email, message, callback) {

    var config = {
           mail: require('../config/mail')
       },
      nodemailer  = require('nodemailer'),
      smtpTransport = nodemailer.createTransport('SMTP', config.mail);
        
        smtpTransport.sendMail({
          from: email,
          to: 'raosharat@gmail.com',
          subject: message,
          text: message
        }, function fallBack(err) {
          if (err) {
            callback(false);
          } else {
            callback(true);
          }
        });
}; 

// ---------------- End Utility METHODS ------------------

// ---------------- BEGIN PUBLIC METHODS ------------------
configRoutes = function(app, server, passport){
  chat.connect(server);
  app.get('/', function (req, res) {
    res.sendfile('views/index.html');
  }); 

  app.get('/contact', function(req, res){ 
    if(req.isAuthenticated()){
      res.render('contact', { userName : req.user.facebook.name, userEmail: req.user.facebook.email});
    }else{
      console.log("Unauthenticated user");
      res.render('contact', { userName : null, userEmail: null});
    }
  });

  app.get('/auth/facebook', passport.authenticate("facebook", {scope:"email"}));

  app.get("/auth/facebook/callback", 
    passport.authenticate("facebook",{ failureRedirect: '/login'}),
    function(req,res){
      res.render('contact', { userName : req.user.facebook.name, userEmail: req.user.facebook.email});
    }
  );

  app.post('/mailsend', function (req, res) {
    var name = req.param('name', ''),
        message = req.param('message', ''),
        email = req.param('email', null);
    console.log("Mail request came from" + email);
    writeEMail(name, email, message, function(success){
      if (success) {
        res.send('success');
      } else {
        res.send('failure');
      }
    });
  });
  
};
module.exports = { configRoutes : configRoutes };
// ---------------- ENDPUBLIC METHODS ------------------



/*  app.post('/login', function(req, response){
    var email = req.body.email,
        password = req.body.password;
    console.log('Request received to login received with email: ' + email + ' Password: ' + password);
 
    if(email == "raosharat@gmail.com" && password =="Tenacity456!"){
      console.log("Welcome Pandeshwar. You are authorized.");
      is_pandeshwar_logged_in = true;
      //console.log('Set name to Pandeshwar');
      response.cookie('name', 'Pandeshwar', { signed: true });
      //response.cookie('name', 'Pandeshwar');
      //res.render('contact', {chatstatus: check_LoginStatus()});
      response.writeHead(301, {Location: '/contact'});
      response.end();
    } 
    else {
      res.send(404);
    } 
 
  }); */

/*  app.post('/logout', function(req, response){
   var email = req.body.email,
       password = req.body.password;
   //console.log('Request received to logout with email: ' + email + ' Password: ' + password);
   if(email == "raosharat@gmail.com" && password =="uthinkIllkeepthepasswordhere"){
    console.log("GoodBye Pandeshwar. You are logged out.");
    is_pandeshwar_logged_in = false; 
    //res.render('contact', {chatstatus: check_LoginStatus()});
    response.writeHead(301,
     {Location: '/contact'}
    );
    response.end();

   } 
   else {
    res.send(404);
  }
  }); 

    app.get('/logout', function(req, res){
   res.render('logout');
  }); */