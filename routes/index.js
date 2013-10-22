module.exports = function(app, server, sessionStore) {

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
  console.log('User name is:: '  + req.cookies.name);
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
  //console.log('Set name to Pandeshwar');
  response.cookie('name', 'Pandeshwar', { signed: true });
  //response.cookie('name', 'Pandeshwar');

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
 if(email == "raosharat@gmail.com" && password =="uthinkIllkeepthepasswordhere"){
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

io.set('authorization', function (data, accept) {
        
        console.log("authorization step::");
        if (data.headers.cookie) {
            //console.log("cookie found");
            data.cookie = require('cookie').parse(data.headers.cookie);
         // var  = require('connect').utils.parseSignedCookie(data.headers.cookie);
            var signeduser = data.cookie['name'] || "useless";
            //console.log("signed user " + signeduser);
            var user_name = require('connect').utils.parseSignedCookie(signeduser, 'somesuperspecialsecrethere');
            //console.log("decrypted name " + user_name);

            if(user_name == "Pandeshwar"){
                data.user = user_name;
                console.log("Confirmed Pandeshwar");
            }
        } 
         accept(null, true);
});

 io.sockets.on('connection', function(socket){ //begin of socket connect
  socket.on('new user', function(data, callback){

    var user_name = socket.handshake.user;
    //console.log("New connection received from " + data);
    //console.log("As set by cookie name is " + user_name);

    if(data == "Pandeshwar" && !(is_pandeshwar_logged_in)){
      callback("Fucker. You cannot be Pandeshwar");
      return;
    } 

    if(data == "Pandeshwar" && user_name != "Pandeshwar"){
      callback("Fucker. You aren't Pandeshwar");
      return;
    }


    if(!is_pandeshwar_logged_in){
      callback("Pandeshwar is currently Offline. Please come back later.");
      return;
    }

      if((data != "Pandeshwar") && !("Pandeshwar" in users)){
        callback("Pandeshwar is currently Offline. Please come back later.");
        return;
      }  

    if (data in users){
      callback("Username already taken. Try another one.");
    } else{
      callback("success");
      socket.nickname = data;
      users[socket.nickname] = socket;
      updateNicknames();
      socket.broadcast.emit('announcement', socket.nickname + " joined the chat.<br/>");
    } 
  });
  
  function updateNicknames(){
    io.sockets.emit('usernames', Object.keys(users));
  }

  socket.on('send message', function(data, callback){
    //console.log("Message received" + data);
    var msg = data.trim();
    //console.log('after trimming message is: ' + msg);
    
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
          //console.log('message sent is: ' + msg);
          //console.log('Whisper!');      
        } else{
          callback('Error!  Enter a valid user.');
        }
      } else{
        callback('Error!  Please enter a message for your whisper.');
      }
    } else{
      socket.broadcast.emit('new message', {msg: msg, nick: socket.nickname});
      users[socket.nickname].emit('new message', {msg: msg, nick: "Me"});
    }
  });
  
  socket.on('disconnect', function(data){
    console.log(socket.nickname + " dropped connection");
      if(!socket.nickname) return;
      if(socket.nickname =="Pandeshwar") { is_pandeshwar_logged_in = false;  }
        socket.broadcast.emit('disconnection', socket.nickname + " left the chat.<br/>");
        delete users[socket.nickname];
        updateNicknames();

  });
});  //end of socket connect

}    

