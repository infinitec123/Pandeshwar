



exports.index = function(req, res){
  //res.render('index', { title: 'Express' });
  res.sendfile('views/index.html');
};

exports.contact = function(req, res){
  //res.sendfile('views/contact.html');
  res.render('contact', {title: 'Chat with Pandeshwar'});
};

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
};


