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
  globalGCMRegistrationIDs,
  chat        = require( './chat' ),
  Auth = require('./authorization');
  ;

var gcm = require('node-gcm');

// ------------- END MODULE SCOPE VARIABLES ---------------

//---------------- BEGIN Utility METHODS ------------------

logTime = function(){
  var d = new Date();
  var a_p = "";
  var m_names = new Array("January", "February", "March","April", "May", "June", "July", "August", "September", "October", "November", "December");
  var curr_hour = d.getHours();
  var curr_date = d.getDate();
  var curr_month = d.getMonth();
  var curr_year = d.getFullYear();

  if (curr_hour < 12){
   a_p = "AM";
  }else{
   a_p = "PM";
  }
  if (curr_hour == 0){
   curr_hour = 12;
  }
  if (curr_hour > 12){
   curr_hour = curr_hour - 12;
  }

  var curr_min = d.getMinutes();

  console.log(curr_date + "-" + m_names[curr_month] + "-" + curr_year + ":" + curr_hour + " : " + curr_min + " " + a_p);
};


sendGcm = function(fund, fund_id, agent_name, agent_id, amount, role, successCallback, failureCallback){
  
  var sender = new gcm.Sender('AIzaSyAePdtufYiOlGDf6uuZ7aE6ft6PiBMWNOc');  
  var registrationIds = [];

  var message = new gcm.Message();
  message.addDataWithKeyValue('fund',fund);
  message.addDataWithKeyValue('fund_id',fund_id);
  
  message.addDataWithKeyValue('agent', agent_name);
  message.addDataWithKeyValue('agent_id', agent_id);
  
  message.addDataWithKeyValue('amount',amount);
  message.addDataWithKeyValue('role',role);

  message.collapseKey = 'Ftator';
  message.delayWhileIdle = false;
  message.timeToLive = 3;
  
  //var agentClientId1 = 'APA91bEyZQX9kMjO60R-uTqGjhmagIpowTuYTrCQolGPr3I9WgPnbt44ouELf8DR41957HmHy2FwhZNOvhHaaWp4fuyZ_KO1RyQVWZWfgj1ykpM2heVOlJQKKLn9rczuBg-f9942FrS1TXtU6osKxIbFT_WgQtojAnachMYRc2mPcRbeyhU7AXk';
  var clientGCMId2 = 'APA91bHHFxo9YLEbd7663YQjLFzye_reBXw7NIC-8uAOW5W5JqSqkzMy6HF7PWqNptjGfBLeq3amgdrR2m0Rxzj0waiQKQzyfE4rpRKVRwIrr2xt16bD2jCNk5erP4N49mH2WDV4nIoKoivOC9AVo2TVwjyGd6FzApGyUAeQLZutqoofPMGr3jA';
  registrationIds.push(clientGCMId2);

  sender.send(message, registrationIds, 4, function (err, result) {
      if(!err){
          //res.send("GCM successfully sent." + result);
          console.log(result);
          successCallback(result);
      } else{
          //res.send("GCM send failed" + result);
          console.log(result);
          failureCallback();
      }
  });


};

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
  //
  //
  
  app.post('/gcmregistration', function(req, res){
    var gcm_id = req.body.gcm_id;
    console.log('GCM ID Save request Received!');
    logTime();
    console.log(gcm_id);
    res.setHeader('Content-Type', 'application/json');

   // var result = {
    //'result' : 'GCM Id Noted'
    //}
    res.json({ 'result': 'GCM Id Noted' });

    //res.end(JSON.stringify({ a: 1 }));
    //globalGCMRegistrationIDs.push(gcm_id);
  });  
  
  app.post('/sendgcm', function(req, res){
    console.log('Send GCM request received!');
    logTime();
     var fund = req.body.fund;
     var fund_id = req.body.fund_id;
     
     
     var agent_name = req.body.agent_name;
     var agent_id = req.body.agent_id;
     var role = req.body.role;

     var amount = req.body.amount;
     
     console.log('Fund: ' + fund);
     console.log('Amount: ' + amount);
     console.log('Agent: ' + agent_name);
     console.log('Agent ID: ' + agent_id);
     console.log('Role: ' + role);

     sendGcm(fund, fund_id, agent_name, agent_id, amount, role, function(result){
      res.json(result);
     }, function(){
      res.send('Sending GCM failed!');
     }); 
  });
  
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
    
  
    // add new key-value in data object
   var sender = new gcm.Sender('AIzaSyAePdtufYiOlGDf6uuZ7aE6ft6PiBMWNOc');

  
    var registrationIds = [];

    // OPTIONAL
    // add new key-value in data object
    //var message = new gcm.Me
    message.addDataWithKeyValue('Fund','Templeton India  Pension Plan - Dividend');
    message.addDataWithKeyValue('Amount','100001');
    message.collapseKey = 'Ftator';
    message.delayWhileIdle = true;
    //message.restricted_package_name='hhsr.hexagon.ftatordemoagent';
    message.timeToLive = 3;
    
    //var agentClientId = 'APA91bEyZQX9kMjO60R-uTqGjhmagIpowTuYTrCQolGPr3I9WgPnbt44ouELf8DR41957HmHy2FwhZNOvhHaaWp4fuyZ_KO1RyQVWZWfgj1ykpM2heVOlJQKKLn9rczuBg-f9942FrS1TXtU6osKxIbFT_WgQtojAnachMYRc2mPcRbeyhU7AXk';
    var clientGCMId = 'APA91bHHFxo9YLEbd7663YQjLFzye_reBXw7NIC-8uAOW5W5JqSqkzMy6HF7PWqNptjGfBLeq3amgdrR2m0Rxzj0waiQKQzyfE4rpRKVRwIrr2xt16bD2jCNk5erP4N49mH2WDV4nIoKoivOC9AVo2TVwjyGd6FzApGyUAeQLZutqoofPMGr3jA';
    registrationIds.push(clientGCMId);

    sender.send(message, registrationIds, 4, function (err, result) {
      if(!err){
          res.send("GCM successfully sent." + result);
          console.log(result);
      } else{
          res.send("GCM send failed" + result);
          console.log(result);
      }

    });
  });  //End of sendgcm


  
};
module.exports = { configRoutes : configRoutes };
// ---------------- ENDPUBLIC METHODS ------------------
