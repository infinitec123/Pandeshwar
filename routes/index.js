module.exports = function(app, server) {

var is_pandeshwar_logged_in = false;  

var check_LoginStatus = function(){
  var chat_line = "Pandeshwar is Offline";
  
  if(is_pandeshwar_logged_in){
    chat_line = "Pandeshwar is Online";
  }
  return chat_line
}

app.get('/', function (req, res) {
  //console.log('::::' + req.session.pandeshwar);
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

//Socket Functions
users = {};

 io.sockets.on('connection', function(socket){
  socket.on('new user', function(data, callback){
    console.log("New connection received from " + data);

    if(data == "Pandeshwar" && !(is_pandeshwar_logged_in)){
      callback("Fucker. You cannot be Pandeshwar");
      return;
    }

    if(!is_pandeshwar_logged_in){
      callback("Pandeshwar is currently offline. Please come back later.");
      return;
    }

      if((data != "Pandeshwar") && !("Pandeshwar" in users)){
        callback("Pandeshwar is currently offline. Please come back later.");
        return;
      } 

    if (data in users){
      callback("Username already taken. Try another one.");
    } else{
      callback("success");
      socket.nickname = data;
      users[socket.nickname] = socket;
      updateNicknames();
    } 
  });
  
  function updateNicknames(){
    io.sockets.emit('usernames', Object.keys(users));
  }

  socket.on('send message', function(data, callback){
    console.log("Message received" + data);
    var msg = data.trim();

    console.log('after trimming message is: ' + msg);
    
    // Start using @ instead

    if(msg.substr(0,1) === '@'){
      //Whisper found.
      msg = msg.substr(1);
      var ind = msg.indexOf(' ');
      
      if(ind !== -1){
        var name = msg.substring(0, ind);
        var msg = msg.substring(ind + 1);
        //console.log("Whisper FOund::" + name + "::" + msg )
        if(name in users){
          users[name].emit('whisper', {msg: msg, nick: socket.nickname});
          users[socket.nickname].emit('whisper', {msg: msg, nick: socket.nickname});
          console.log('message sent is: ' + msg);
          console.log('Whisper!');      
      //@ should end here.
        } else{
          callback('Error!  Enter a valid user.');
        }
      } else{
        callback('Error!  Please enter a message for your whisper.');
      }
    } else{
      io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
    }
  });
  
  socket.on('disconnect', function(data){
    console.log(socket.nickname + " dropped connection");
      if(!socket.nickname) return;
        delete users[socket.nickname];
        updateNicknames();
  });
}); 

}    

