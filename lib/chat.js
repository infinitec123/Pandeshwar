/*
 * chat.js - module to provide chat messaging
*/

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------
'use strict';
var
  
  socket = require( 'socket.io' ),
  chatObj,
  users  = [], //To save user data
  socket_list = {}, //To save reference to
  removeUser, printArray, emitUserList, broadcastInfo; 
  ;
// ------------- END MODULE SCOPE VARIABLES ---------------

// ---------------- BEGIN UTILITY METHODS -----------------

  removeUser = function(_email){
    var tempUsers = users.filter(function(obj){
      return (obj.email !== _email);
    });

    users  = tempUsers;
    //console.log("After Dropping users array is")
    //printArray(users);
  };

  printArray = function(_arr){
    for (var i = 0; i < _arr.length; i = i + 1) {
      console.log(_arr[i].name + "::" + _arr[i].email);
    }
  };

  emitUserList = function(io){
    //console.log("When I sent users was like this");
    //printArray(users);
    io
     .of('/chat')
     .emit('NewUsersListBroadcast', users);

  };

  broadcastInfo = function(socket, _event, data){
    socket.broadcast.emit(_event, _event, data);
  };


       

// ----------------- END UTILITY METHODS ------------------

// ---------------- BEGIN PUBLIC METHODS ------------------
chatObj = {
  connect : function ( server ) {
    var io = socket.listen( server );
   /* io.configure(function () { 
      io.set("transports", ["xhr-polling"]); 
      io.set("polling duration", 10); 
    }); */

    /*
        Receive: NewUserReQuest, UserDropRequest
        Send: NewUserApproval, NewUsersListBroadcast, NewMessage
    */

    // Begin io setup
    io
      .of('/chat')
      .on( 'connection', function ( socket ) {
        console.log("New connection");
        socket.on('NewUserReQuest', function(data){
          //Do you want to do any more authorization?
          socket.emit('NewUserApproval', data);
          socket.nickname = data.email;
          socket_list[socket.nickname] = socket;
          users.push(data);
          emitUserList(io);
        }); 

      socket.on('UserDropRequest', function(data){
        console.log('Drop Request');
        removeUser(data.email);
        //emitUserList(io);
        //broadcastInfo(socket, 'NewUsersListBroadcast');
        socket.broadcast.emit('NewUsersListBroadcast', users);
      });

      socket.on('NewMessage', function(chat_map){
        console.log('NewMessage Request::' + chat_map);
        socket_list[chat_map.dest_email].emit('NewMessage', chat_map);
      });



      socket.on('disconnect', function(data){
         console.log(socket.nickname + " dropped connection");
         if(!socket.nickname) return;
         removeUser(socket.nickname);
         //emitUserList(io);
         //broadcastInfo(socket, 'NewUsersListBroadcast', users);
         socket.broadcast.emit('NewUsersListBroadcast', users);
      });   
      }
    );
    // End io setup

    return io;
  }
};

module.exports = chatObj;
// ----------------- END PUBLIC METHODS -------------------


/*
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
});  //end of socket connect */
