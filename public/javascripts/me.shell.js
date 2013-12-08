/*
 * me.shell.js
 * Acts as main controller
*/

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/
/*global $, me */

me.shell = (function(){
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var 
    stateMap = {
      $container  : undefined
    },

    jqueryMap = {}, onTapAcct, initModule, setJqueryMap;


  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  //------------------- END UTILITY METHODS --------------------

  //------------------- BEGIN DOM METHODS ----------------------
  // Begin DOM Method setJqueryMap
  setJqueryMap = function(){
    jqueryMap = {
      $invite      : $('#chatInvite')
    };
  };
  // End DOM Method setJqueryMap
  //------------------- END DOM METHODS ------------------------

  //------------------- BEGIN EVENT HANDLERS --------------------
  //Begin onTapAcct Method
  //Purpose: Take Username
  /*onTapAcct = function(){
    var user_name;
        //user = 'Sharath',  // ***** Hardcoded now. To come from me.model.user
        // ***** Check if user is anonymour or not. Use same handler to login and log out. Now only login.
        user_name = prompt('Please select a name');
        console.log(user_name);
        me.chatui.setSliderPosition('opened');
        //var socket = io.connect( '/chat' );
        // Consult server
        return false;
  }; */
  //------------------- END EVENT HANDLERS ----------------------

  //------------------- BEGIN CALLBACKS -------------------
  //------------------- END CALLBACKS ----------------------

  //------------------- BEGIN PUBLIC METHODS -------------------



  initModule = function($container, $name, $email){
  	//console.log("Shell module "  + $container);
    stateMap.$container = $container;
    me.chatui.initModule($container, $name, $email);
    setJqueryMap();

    //jqueryMap.$invite.bind('utap', onTapAcct);
  };
  return {initModule: initModule};
//------------------- END PUBLIC METHODS ---------------------
}());