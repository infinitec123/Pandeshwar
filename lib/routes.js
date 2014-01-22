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
