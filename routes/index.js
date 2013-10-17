module.exports = function(app, models) {

var is_pandeshwar_logged_in = false;  

var check_LoginStatus = function(){
  var chat_line = "Pandeshwar is Offline";
  
  if(is_pandeshwar_logged_in){
    chat_line = "Pandeshwar is Online";
  }
  return chat_line
}

app.get('/', function (req, res) {
  res.sendfile('views/index.html');
});

app.get('/contact', function (req, res) {
  res.render('contact', {chatstatus: check_LoginStatus()});
});


var writeEMail = function(name, email, message, callback) {

    var config = {
           mail: require('../config/mail')
       }  
      var nodemailer  = require('nodemailer');
      var smtpTransport = nodemailer.createTransport('SMTP', config.mail);
        
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

app.post('/mailsend', function (req, res) {
  var name = req.param('name', '');
    var message = req.param('message', '');
    var email = req.param('email', null);
    //console.log("Post request came from" + email);
    writeEMail(name, email, message, function(success){
      if (success) {
        res.send('success');
      } else {
        res.send('failure');
      }
});
});


app.get('/login', function(req, res){
 res.render('login');
});

app.get('/logout', function(req, res){
 res.render('logout');
});

app.post('/login', function(req, response){
 var email = req.body.email;
 var password = req.body.password;
 console.log('Request received to login received with email: ' + email + ' Password: ' + password);
 if(email == "raosharat@gmail.com" && password =="Tenacity456!"){
  console.log("Welcome Pandeshwar. You are authorized.");
  is_pandeshwar_logged_in = true; 
    //res.render('contact', {chatstatus: check_LoginStatus()});
    response.writeHead(301,
     {Location: '/contact'}
    );
    response.end();

 } else {res.send(404);}
 
});

app.post('/logout', function(req, response){
 var email = req.body.email;
 var password = req.body.password;
 console.log('Request received to logout with email: ' + email + ' Password: ' + password);
 if(email == "raosharat@gmail.com" && password =="Tenacity456!"){
  console.log("GoodBye Pandeshwar. You are logged out.");
  is_pandeshwar_logged_in = false; 
    //res.render('contact', {chatstatus: check_LoginStatus()});
    response.writeHead(301,
     {Location: '/contact'}
    );
    response.end();

 } else {res.send(404);}
 
});

}    



/* exports.index = function(req, res){
  //res.render('index', { title: 'Express' });
  res.sendfile('views/index.html');
};

exports.contact = function(req, res){
  //res.sendfile('views/contact.html');
  res.render('contact', {title: 'Chat with Pandeshwar'});
}; 


exports.mailwrite = function (req, res) {
    var name = req.param('name', '');
    var message = req.param('message', '');
    var email = req.param('email', null);
    //console.log("Post request came from" + email);
    writeEMail(name, email, message, function(success){
      if (success) {
        res.send('success');
      } else {
        res.send('failure');
      }
    }); 

   /* */


