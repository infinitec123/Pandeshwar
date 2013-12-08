/*
 * me.chatui.js
 * Feature module to manage Chat UI
*/

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/
/*global $, me */

me.chatui = (function(){
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var 

    configMap = {
     
      main_html : String()
        + '<div class="me-chat" style="height: 0px;" >'
          + '<div class="me-chat-head">'
            + '<div class="me-chat-head-toggle">+</div>'
            + '<div class="me-chat-head-title">'
              + 'Chat'
            + '</div>'
          + '</div>'
          + '<div class="me-chat-sizer" style="height: 230px;">'
            + '<div class="me-chat-list">'
              + '<div class="me-chat-list-box"></div>'
            + '</div>'
            + '<div class="me-chat-msg">'
              + '<div class="me-chat-msg-log"></div>'
              + '<div class="me-chat-msg-in">'
                + '<form class="me-chat-msg-form">'
                  + '<input type="text"/>'
                  + '<input type="submit" style="display:none"/>'
                  + '<div class="me-chat-msg-send">'
                    + 'Send'
                  + '</div>'
                + '</form>' 
              + '</div>' 
            + '</div>'
          + '</div>' 
        + '</div>',

      slider_open_time     : 250,
      slider_close_time    : 250,
      slider_opened_px     : 254,
      slider_closed_px     : 24,
      slider_opened_title  : 'Tap to Close',
      slider_closed_title  : 'Tap to Open'
    },

    stateMap = {
      $append_target : null,
      position_type    : ''
    },

    //jqueryMap = {}, 
    setjQueryMap, clearChat, 
    onLogout, onTapToggle, 
    onTapList, onLogin, setSliderPosition, 
    onListUpdate, onSetchatee,
    writeAlert, initModule, 
    writeChat, scrollChat,
    onSubmitMsg, onUpdatechat, LogMeout ;

    jqueryMap = {};


  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------



  //------------------- END UTILITY METHODS --------------------

  //------------------- BEGIN DOM METHODS -----------------------

  // Begin DOM method /setjQueryMap 

  setjQueryMap = function(){
  	var 
  	  $append_target = stateMap.$append_target,
  	  $slider = $append_target.find('.me-chat');

  	jqueryMap = {
      $slider   : $slider,
      $head     : $slider.find( '.me-chat-head' ),
      $toggle   : $slider.find( '.me-chat-head-toggle' ),
      $title    : $slider.find( '.me-chat-head-title' ),
      $sizer    : $slider.find( '.me-chat-sizer' ),
      $list_box : $slider.find( '.me-chat-list-box' ),
      $msg_log  : $slider.find( '.me-chat-msg-log' ),
      $msg_in   : $slider.find( '.me-chat-msg-in' ),
      $input    : $slider.find( '.me-chat-msg-in input[type=text]'),
      $send     : $slider.find( '.me-chat-msg-send' ),
      $form     : $slider.find( '.me-chat-msg-form' ),
      $welcome_body  : $('#welcomebox_body'),
      $welcome_title : $('#welcomebox'),
      $chatInvite    : $('#chatInvite'),
      $window   : $(window)
    };

  };

  // End of DOM method /setjQueryMap 

  clearChat = function () { 
    jqueryMap.$msg_log.empty(); 
  };

  scrollChat = function(){
    var $msg_log = jqueryMap.$msg_log;
    $msg_log.animate({
      scrollTop: $msg_log.prop('scrollHeight') - $msg_log.height() 
    }, 150);
  };

  writeAlert = function(alert_text){
    jqueryMap.$msg_log.append(
      '<div class="me-chat-msg-log-alert">'
      + alert_text
      + '</div>'
    );
    scrollChat();
  };

  writeChat = function(person_name, text){
    var msg_class;
    if(person_name === 'Me'){
      msg_class = 'me-chat-msg-log-me';
    } else {
      msg_class = 'me-chat-msg-log-msg';
    }
    jqueryMap.$msg_log.append(
      '<div class="' + msg_class + '">'
      + person_name + ': ' 
      + text
    );
    scrollChat();
  };

  //------------------- END DOM METHODS ------------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  //Begin of onTapToggle
  onTapToggle = function(){
  	//console.log('Click requested');
  	if(stateMap.position_type === 'opened'){
  	  setSliderPosition('closed');
  	} else if (stateMap.position_type === 'closed'){
  	  setSliderPosition('opened');
  	}
  	return false;
  };
  //End of onTapToggle

  onLogin = function(){
    setSliderPosition('opened');
    jqueryMap.$welcome_body.html('<button id="log_out" type="submit" class="btn btn-info">Logout</button>');
    jqueryMap.$logout_button = $('#log_out');
    jqueryMap.$logout_button.bind('click', LogMeout);
  };

  onLogout = function(){
    clearChat();
    setSliderPosition('hidden');
    jqueryMap.$welcome_body.empty();
    jqueryMap.$welcome_title.html('<a href="/auth/facebook" class="btn btn-primary">Login through FaceBook to Chat</a>');
  };

  onUpdatechat = function(event, msg_map){
    var 
      is_user,
      sender_name = msg_map.sender_name,
      sender_email = msg_map.sender_email,
      msg_text  = msg_map.msg_txt,
      _user = me.model.people.get_user();
      
      is_user = sender_email === _user.email;
      if(is_user){
        writeChat('Me', msg_text); 
      } else {
        writeChat(sender_name, msg_text); 
        $.titleAlert(sender_name, {stopOnMouseMove:true, stopOnFocus:false});
      }
  };

  onListUpdate = function(){
    var i, 
        select_class,
        list_html ="",
        _chattersList = me.model.chat.get_chatters(),
        _chatee = me.model.chat.get_chatee(),
        _user = me.model.people.get_user();

    for(i = 0; i < _chattersList.length; i = i + 1){
      select_class = '';
      
      if(_user.email === _chattersList[i].email){
        continue;
      }

      if(_chatee && _chatee.email === _chattersList[i].email){
        select_class=' me-x-select';
      }

      list_html
        += '<div class="me-chat-list-name'
        + select_class + '" data-email="' + _chattersList[i].email + '" '
        + 'data-name="' + _chattersList[i].name + '"'
        + '>'
        + _chattersList[i].name + '</div>';
    } // End of for loop
    
    if ( list_html ==="" ) {
      list_html = String()
        + '<div class="me-chat-list-note">'
        + 'Great Souls talk to themselves...<br><br>'
        + 'No one is Online'
        + '</div>';
      clearChat();
    }
    //console.log(list_html);
    jqueryMap.$list_box.html(list_html);
  };

  // to select the chatee
  onTapList = function(event){
    
    var chatee_email, chatee_name,
        $tapped = $( event.elem_target );

    if(! $tapped.hasClass('me-chat-list-name')) {
      return false;
    }
    chatee_name = $tapped.attr('data-name');
    chatee_email = $tapped.attr('data-email');
    me.model.chat.set_chatee(chatee_name, chatee_email);
    return false;
  };

  // To change UI when chatee is changed
  onSetchatee = function(event, arg_map){
    var
      new_chatee = arg_map.new_chatee,
      old_chatee = arg_map.old_chatee;

      if(! new_chatee){
        if(old_chatee){
          writeAlert(old_chatee.name + ' left the chat');
          jqueryMap.$title.text( 'Chat' );
          jqueryMap.$list_box
            .find('.me-chat-list-name')
            .removeClass('me-x-select');
        return false;
        }
      }
      writeAlert('Chatting with ' + new_chatee.name);
      jqueryMap.$title.text('Chatting with ' + new_chatee.name);

      jqueryMap.$list_box
        .find('.me-chat-list-name')
        .removeClass('me-x-select');

      jqueryMap.$list_box  
        .find('[data-email="' + new_chatee.email + '"]')
        .addClass('me-x-select');
  
      return true;
  };
  //Function to handle 'sending' the chat!
  onSubmitMsg = function(event){
    
    var msg_text = jqueryMap.$input.val().trim(),
        _name  =  me.model.people.get_user().name,
        _email = me.model.people.get_user().email,
        //_arr,
        _msg_body = '' ; 

    if(msg_text === ''){
      return false;
    }

    // If one is alone whatever they speak will be mailed to me.
    if(me.model.chat.get_chatters().length === 1){
      console.log('Here1');
      writeChat('Me', jqueryMap.$input.val());
      jqueryMap.$input.val('');
      jqueryMap.$input.focus();    
      
      if($(event.target).hasClass('me-chat-msg-send')){
        console.log('Here2');
        _arr = jqueryMap.$msg_log.find('.me-chat-msg-log-me');
        console.log(_arr);
        for(var i=0; i<_arr.length; i = i+1){
          _msg_body += $(_arr[i]).text() + "\n";
        }
           
        //_msg_body = jqueryMap.$msg_log.val(); 
        console.log('Its send button!' + _name + "::" + _email + "::" + _msg_body);
        me.mail.mailMethod(_name, _email, _msg_body, function(_res){
          if(_res === 'success'){
            clearChat();
          }
        });
      } 
      return false;
    } 

    if(! me.model.chat.get_chatee()){
      writeAlert('Select whom to');
      return false;
    }

    me.model.chat.send_msg( msg_text );
    jqueryMap.$input.val('');
    jqueryMap.$input.focus();
    jqueryMap.$send.addClass('me-x-select');
    setTimeout(function(){
      jqueryMap.$send.removeClass('me-x-select');
    }, 250);
    return false;
  };

  LogMeout = function(){
    //console.log('Applying to logout!');
    me.model.people.logout();
  }



  //------------------- END EVENT HANDLERS ----------------------

  //------------------- BEGIN CALLBACKS -------------------
  //------------------- END CALLBACKS ----------------------

  //------------------- BEGIN PUBLIC METHODS ------------------- 

  //Begin public Method setSliderPosition
  // Example Usage: me.chatui.setSliderPosition('Opened');
  // Purpose: Toggle height of chat slider
  // Arguments: 
  //   * position_type - enum('closed', 'opened', or 'hidden')
  //   * callback - optional callback to be run end at the end
  //     of slider animation.  The callback receives a jQuery
  //     collection representing the slider div as its single
  //     argument
  //Action: 
  //	Moves slider to requested position. If the requested position is the current position, it
  // returns true without taking further action. 
  // Returns:
  //	* true: The requested postion was achieved.
  // 	* false: The requested postion was not achieved.
  // Throws: none

  setSliderPosition = function(position_type, callback){
  	var
  	  height_px, animate_time, slider_title, toggle_text;
  	
  	// If the user is not logged in && position_type='opened' return false
  	// *****
  	
  	// return true if slider already in requested position
  	if(stateMap.position_type === position_type){
  		if(position_type === 'opened'){
  			jqueryMap.$input.focus();
  		}
  		return true;
  	}

  	switch(position_type){
  	  case 'opened':

  	    height_px = configMap.slider_opened_px;
  	    animate_time = configMap.slider_open_time;
  	    slider_title = configMap.slider_opened_title;
  	    toggle_text = '-';
  	  break;

  	  case 'hidden' :
  	    height_px = 0;
  	    animate_time = configMap.slider_open_time;
  	    slider_title ='';
  	    toggle_text = '+';
  	  break;

  	  case 'closed':
  	    height_px = configMap.slider_closed_px;
  	    animate_time = configMap.slider_close_time;
  	    slider_title = configMap.slider_closed_title;
  	    toggle_text = '+';
  	  break;

      // bail for unknown position_type
      default : return false;
  	}

  	stateMap.position_type = '';
  	//console.log(height_px);
  	jqueryMap.$slider.animate(
  	  {height: height_px},
  	  animate_time,
  	  function(){
  	  	jqueryMap.$toggle.prop('title', slider_title);
  	  	jqueryMap.$toggle.text(toggle_text);
  	  	stateMap.position_type = position_type;
  	  	if(callback) { callback(jqueryMap.$slider); }
  	  }
  	);
  	return true;
  };
  // ENd of setSliderPosition


  // Begin public method /initmodule
  //Example Usage: me.chatui.initModule($('#div_id'))
  // Purpose: 
  // Argument:
  //Action: 
  initModule = function($append_target,  $name, $email){

    stateMap.$append_target = $append_target;
    $append_target.append(configMap.main_html);
    setjQueryMap();
    
    //Since we are coming till here only through FB login it means I want to chat
    // and want to enter the chat room. So lets login.
    me.model.people.login($name, $email);

    // Event bindings

    $.gevent.subscribe(jqueryMap.$list_box, 'me-login', onLogin);
    $.gevent.subscribe(jqueryMap.$list_box, 'me-logout', onLogout);
    $.gevent.subscribe(jqueryMap.$list_box, 'me-listchange', onListUpdate);
    $.gevent.subscribe( jqueryMap.$list_box, 'me-setchatee',  onSetchatee  );
    $.gevent.subscribe( jqueryMap.$list_box, 'me-updatechat',  onUpdatechat);
    
    jqueryMap.$head.bind('utap', onTapToggle);    
    jqueryMap.$list_box.bind('utap', onTapList);
    jqueryMap.$send.bind('utap', onSubmitMsg);
    jqueryMap.$form.bind('submit', onSubmitMsg);

  };
  return {
  	setSliderPosition: setSliderPosition,
  	initModule: initModule
  };
  //------------------- END PUBLIC METHODS ---------------------
}());