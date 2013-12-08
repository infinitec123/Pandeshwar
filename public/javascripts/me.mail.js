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
		initModule, mailMethod, 
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
    //------------------- END EVENT HANDLERS ---------------------
    
    //------------------- BEGIN CALLBACKS ------------------------
    //------------------- END CALLBACKS --------------------------
    
    //------------------- BEGIN PUBLIC METHODS -------------------
    initModule = function(){
  	  setjQueryMap();
    };
	
    return {
  	  initModule: initModule,
  	  mailMethod: mailMethod
    }; 
    //------------------- END PUBLIC METHODS ----------------------
}());

