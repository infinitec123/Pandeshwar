/*
 * me.js
 * Root namespace module
*/

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/
/*global $, me */

me.mail = (function() {
    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
	var 
		jqueryMap = {},
		initModule, mailMethod, onSubmitMail,
		validateEmail, setjQueryMap;
    //----------------- END MODULE SCOPE VARIABLES ---------------

    //------------------- BEGIN UTILITY METHODS ------------------
 
	validateEmail =	function (email) { 
   	  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
	}; 

 	mailMethod = function($from_name, $from_email, $body, callback){
 	  if($from_name === "" || !validateEmail($from_email) || $body ===""){
		alert("Fill the form completely.");
	  } else {
		$.post('/mailsend', { name: $from_name, 
							  email: $from_email, 
							  message: $body}, 
							  function(data) {
        						if(data === 'success') { 
        						  callback('success');		
        						}
      						  });
		return true;
	}	
	};

    //------------------- END UTILITY METHODS --------------------

    //------------------- BEGIN DOM METHODS -----------------------

    setjQueryMap = function(){
  	  jqueryMap = {
        $ContactForm : $('#contactform'),
        $name_sender : $('#name'),
        $email_sender : $('#email'),
        $message : $('#message'),
        $formsubmit_button : $('#contact-submit'),
        $window   : $(window)
      };
    };
    //------------------- END DOM METHODS ------------------------
    
    //------------------- BEGIN EVENT HANDLERS -------------------
    onSubmitMail = function(){
    	var 
    		_sender_name = jqueryMap.$name_sender.val(),
    		_sender_email = jqueryMap.$email_sender.val(),
    		_email_body = jqueryMap.$message.val();
    	console.log('onSubmitMail event handler called');	
    	mailMethod(_sender_name, _sender_email, _email_body, function(data){
    		if(data === 'success') {
    			alert('Mail Sent Successfully!');
    		} else {
    			alert('Mail Send Failed!');
    		}
    	});
    };
    //------------------- END EVENT HANDLERS ---------------------
    
    //------------------- BEGIN CALLBACKS ------------------------
    //------------------- END CALLBACKS --------------------------
    
    //------------------- BEGIN PUBLIC METHODS -------------------
    initModule = function(){
  	  setjQueryMap();
  	  jqueryMap.$formsubmit_button.bind('click', onSubmitMail);
    };
	
    return {
  	  initModule: initModule,
  	  mailMethod: mailMethod
    }; 
    //------------------- END PUBLIC METHODS ----------------------
}());

