/*
 * me.data.js
 * Acts as interface between client and server. 
*/

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/
/*global $, me, io*/

me.data = (function(){
  'use strict';

  var
    stateMap = {sio : null},
    makeSio, getSio;

  makeSio = function(){
    var socket = io.connect('/chat');
    return {
      	emit: function(event_name, data){
      	  socket.emit(event_name, data);
      	},
      	on: function(event_name, callback){
    	  socket.on(event_name, function(){
    	  	//console.log(arguments);
    	  	callback(arguments);
    	  });
      	}
      };
  };

  getSio = function(){
    if(!stateMap.sio) {
    	stateMap.sio = makeSio();
    }
    return stateMap.sio;
  };
  return {getSio: getSio};
}());