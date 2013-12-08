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

var me = (function(){
  'use strict';

  var initModule = function($container, $name, $email){
  	//
    if($name){
      //console.log("Received " + $name + "::" + $email);
      me.shell.initModule($container, $name, $email);
    } else{
      console.log("Chat is not enabled untill you Login");
    }
  	
  };
  return {initModule: initModule};
}());