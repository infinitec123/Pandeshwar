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

var gcm = require('node-gcm');

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

  //Test Portion
  
  app.get('/sendgcm', function(req, res){
    var message = new gcm.Message();
    // or with object values
    var message = new gcm.Message({
      collapseKey: 'Pandeshwar',
      delayWhileIdle: true,
      timeToLive: 3,
      data: {
          key1: 'message1',
          key2: 'message2'
      }
    });
    //var sender = new gcm.Sender('AIzaSyAPzXlxNiGZ5fcpyF_0EeqPXUFutnl4Mn8');
    //Some browser key
    //var sender = new gcm.Sender('AIzaSyC4GanFg_1fpKMcwDjddB0nccOZOtqWNX0');
    var sender = new gcm.Sender('AIzaSyC9HbVIR-EScMdFtJ6k81yP-T3_SQFQiyY');
    var registrationIds = [];

    // OPTIONAL
    // add new key-value in data object
    //var message = new gcm.Me
    message.addDataWithKeyValue('Fund','Templeton India  Pension Plan - Dividend');
    message.addDataWithKeyValue('Amount','100001');
    message.collapseKey = 'Ftator';
    message.delayWhileIdle = true;
    message.restricted_package_name='hhsr.hexagon.ftatordemoagent';
    message.timeToLive = 3;
    
    var agentClientId = 'APA91bEyZQX9kMjO60R-uTqGjhmagIpowTuYTrCQolGPr3I9WgPnbt44ouELf8DR41957HmHy2FwhZNOvhHaaWp4fuyZ_KO1RyQVWZWfgj1ykpM2heVOlJQKKLn9rczuBg-f9942FrS1TXtU6osKxIbFT_WgQtojAnachMYRc2mPcRbeyhU7AXk';
    registrationIds.push(agentClientId);

    sender.send(message, registrationIds, 4, function (err, result) {
      res.send("GCM successfully sent." + result);
      console.log(result);
    });
  });  //End of sendgcm


  
};
module.exports = { configRoutes : configRoutes };
// ---------------- ENDPUBLIC METHODS ------------------
