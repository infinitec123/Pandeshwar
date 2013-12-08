/*
 * me.model.js
 * Holds 'chat' and 'user' model
*/

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/
/*global $, me */

me.model = (function(){
  'use strict';
  var 
   stateMap = {
   	user			: null,
   	is_connected 	: false,
   	chatee : null,
   	chatters		: []
   },
   completeLogin, makePerson, login, logout, get_user, personProto, people, chat;

	/*The people Object API
	-----------------------
	The people object is available at me.data.people. 
	The people object provides methods and events to manage a collection
	of person objects. It's public methods include:
		* get_user - return the current user person object.
		If the user is not signed in, a 'null' is returned.
		
		* login (<person object>) 
		- login as the user with provided details.
		- Uses me.data to emit a socket an event 'NewUserReQuest'
		- Sets a Handler to be invoked when server responds with 'NewUserApproval'
				- Handler sets 'user' with given person object.
				- Handler publishes 'me-login' global event (chatui will follow that)
	
		* logout() 
			- Set the user to 'null' again
			- Use me.data to emit a socket an event 'DropRequest'
			- 
	jQuery global custom events published by the object include:
	* me-login - This is published when a user login process
	  completes. The updated user object is provided as data.
	* me-logout - This is published when a logout completes.
	  The former user object is provided as data.
	
	The attributes for a person object will include
		* email - Got from facebook login
		* name - Got from facebook login
	
	The person object also provides following method
		* get_is_user() - returns true if object is current user	//Din use this (bad code)	
	*/

	personProto = {
		get_is_user : function(){
			return this.name === stateMap.user.name;
		}
	};

	makePerson = function(_name, _email){
		var person;

		if(!(_name && _email)) {
			throw 'Improper data!';
		}

		person = Object.create(personProto);
		person.name = _name;
		person.email = _email;
		return person;
	};

	completeLogin = function(arg_list){
		var data = arg_list[0];
		//console.log("model: received NewUserApproval" + data);
		stateMap.user = makePerson(data.name, data.email);
		$.gevent.publish('me-login', [stateMap.user]);
		chat.join();
		
	};

	people = (function(){

		get_user = function(){
			return stateMap.user;
		};

		login = function(_name, _email){
			//console.log("Inside login of model" + _name + "--" +  _email);
			var sio = me.data.getSio();
			sio.on('NewUserApproval', completeLogin);
			sio.emit('NewUserReQuest', {name: _name, email: _email});
			//stateMap.user = makePerson(_name, _email); Should it be here or after coming from server?
		};

		logout = function(){
			chat.leave();
			$.gevent.publish('me-logout', [stateMap.user]);
			stateMap.user = null;
		};

		return{
			get_user: get_user,
			login: login,
			logout: logout
		};
	}());

	/*

	The chat object API
	- Avaliable at me.model.chat
	- Provides methods and events to manage chat messaging.
	- Provided methods:
		* join() - joins to chatroom. By joining the chat room the 'user' will be able to 
		  follow 'ListUpdate' and 'MessageUpdate' events from server (through me.data)
		* get_chatee() _ return the person with whom the 'user' is chatting (to be selected by chatui on click)
		  If no chatee 'null' will be returned.
		* set_chatee (<person object>) - sets the person as chatee.
			- Emits global event 
		* send_msg(<text>) - sends the text to chatee (Using data)
	- Global custom events it publishes
		* me-setchatee - To announce that chatee has changed with new person object.
		* me-listchange - This is published when a person joins/leaves that. New list wil be given.
		* me-updatechat - TO announce incoming message
	*/

	chat = (function(){
		var
		get_chatee, set_chatee, _publish_listchange, 
		_publish_updatechat, join, leave, 
		get_chatters, send_msg
	   ;

		_publish_listchange = function(arg_list){
			var 
				is_chatee_present = false,
				_usersList = arg_list[0];
			stateMap.chatters = arg_list[0];
			$.gevent.publish('me-listchange', [ arg_list ]);
			/*if(stateMap.chatee){
				console.log("I was chatting with" + stateMap.chatee.email);
			} else {
				console.log("I was chatting with myself");
			} */
			
			//******* if 'chatee' is no longer there 'set_chatee must be called'
			if(stateMap.chatee){

				for(var i=0; i<_usersList.length; i = i+1){
					console.log(_usersList[i].email);
					if(_usersList[i].email === stateMap.chatee.email){
						is_chatee_present = true;
					}
				}
				if(!is_chatee_present) {
					console.log("I suspect the culprit here!");
					//Fuck man.. set_chatee needs email and name! screwed up
					//Write a bad code and publish the event yourself!
					$.gevent.publish('me-setchatee', {old_chatee: stateMap.chatee, new_chatee: null});
					stateMap.chatee = null;

				}
			} 
		};

		_publish_updatechat = function(arg_list){
			var msg_map = arg_list[0];
			if(!stateMap.chatee){
				set_chatee(msg_map.sender_name, msg_map.sender_email);
			} 
			/*else if(msg_map.sender_email !== stateMap.user.email &&
					  msg_map.sender_email !== stateMap.chatee.email){
				set_chatee(msg_map.sender_name, msg_map.sender_email);
			}*/
			$.gevent.publish( 'me-updatechat',  msg_map  );
		};


		join = function(){
			var sio = me.data.getSio();
			if(!stateMap.user) {
				console.warn('User must be set before trying to join the chat');
				return false;
			}
			sio.on('NewUsersListBroadcast', _publish_listchange);
			sio.on('NewMessage', _publish_updatechat);
		};

		leave = function(){
			var sio = me.data.getSio();
			sio.emit('UserDropRequest', {name: stateMap.user.name, email: stateMap.user.email});
		};


		set_chatee = function(_name, _email){
			
			var  _newChatee = makePerson(_name, _email);

			if(stateMap.chatee && (_newChatee.name === stateMap.chatee.name)){
				return false;
			}			
			$.gevent.publish('me-setchatee', {old_chatee: stateMap.chatee, new_chatee: _newChatee});
			stateMap.chatee = _newChatee;
			return true;
		};

		get_chatee = function(){
			return stateMap.chatee;
		};

		get_chatters = function(){
			return stateMap.chatters;
		};

		send_msg = function(msg_txt){
			var msg_map,
				sio = me.data.getSio();
			
			if(!sio) {
				return false;
			}
			
			if(!(stateMap.user && stateMap.chatee)){
				return false;
			}

			//Looks like I am sending too much of payload (name is not needed)!
			msg_map = {
				dest_email 		: stateMap.chatee.email,
				dest_name  		: stateMap.chatee.name,
				sender_name 	: stateMap.user.name,
				sender_email	: stateMap.user.email,
				msg_txt			: msg_txt
			};

			/* The one who has sent the message, will get it instantaneously
    		No round about trip to server. 
    	    They say 'perceived speed' is very important! */

			_publish_updatechat([msg_map]);
			sio.emit('NewMessage', msg_map);
			return true;
		};

		return {set_chatee: set_chatee, 
				get_chatee: get_chatee, 
				get_chatters: get_chatters, 
				join: join, 
				leave: leave,
				send_msg: send_msg
			};
	}());



  return {people: people, chat:chat};
}());