		jQuery(function($){
            
         /*   $.getScript('/socket.io/socket.io.js', function() {
    			alert('Socket was loaded.');
			}); */
            //alert('Page loaded');

            var socket = io.connect();
			var $ContactForm = $('#contactform');
			var $name_sender = $('#name');
			var $email_sender = $('#email');
			var $message= $('#message');
			var $formsubmit_button = $('#contact-submit');
			var $startchat = $('#startchat');
			var $nickBox = $('#nickname');
			var $nickError = $('#nickError');
			var $users = $('#users');
			var $messageForm = $('#send-message');
			var $messageBox = $('#messageip');
			var $chat = $('#chat');
			//var $nickDiv = $('#nickWrap');

			$startchat.click(function(e){
				if($nickBox.val() == ""){
					alert("Enter your Name");
					return;
				}

				var nickname = $nickBox.val();
				var n = nickname.split(" ");
				if(n.length != 1){
					alert("Chose One Word.");
					return;
				}

				$('#applicationstatus').show();

				socket.emit('new user', $nickBox.val(), function(data){
					// Show a message that you have contacted the server.
					$('#applicationstatus').hide();
					if(data == "success"){
						$('#contentWrap').show();
						$('#nickWrap').hide();
					} else{
						$nickBox.val('');
						$nickError.html(data);
					}
				});

			});

			function validateEmail(email) { 
   				 var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    				return re.test(email);
			} 

			function resetForm(){
				$name_sender.val('');
				$email_sender.val('');
				$name_sender.val('');
				$message.val('');
			}

			$messageForm.submit(function(e){
				e.preventDefault();
				if($messageBox.val() == ""){
					return;
				}
				//alert("Will try to submit the form")
				socket.emit('send message', $('#messageip').val(), function(data){
					$chat.append('<span class="error">' + data + "</span><br/>");
				});
				$messageBox.val('');
			});

			$formsubmit_button.click(function(e){
				e.preventDefault();
				if($name_sender.val() == "" || !validateEmail($email_sender.val()) || $message.val() ==""){
					alert("Fill the form completely.");
				} else {
					$.post('/mailsend', { 	name: $name_sender.val(), 
											email: $email_sender.val(), 
											message: $message.val()}, function(data) {
        										if(data == 'success') { 
        											alert("Mail sent Successfully.");
        											resetForm();
        											
        										}
      									} );
					return false;
				}	
			}); 

			socket.on('new message', function(data){
				//$chat.append('<span class="msg"><b>' + data.nick + ': </b>' + data.msg + "</span><br/>");

				var d = new Date();
				var a_p = "";
  				var curr_hour = d.getHours();
  				if (curr_hour < 12) { a_p = "AM"; } else { a_p = "PM"; }
				if (curr_hour == 0) { curr_hour = 12; } 
				if (curr_hour > 12) { curr_hour = curr_hour - 12; }

				var curr_min = d.getMinutes();
				curr_min = curr_min + "";
				if (curr_min.length == 1) { curr_min = "0" + curr_min; }

				var time_string =curr_hour + " : " + curr_min + " " + a_p;

				$chat.append('<span class="msg"><b>' + data.nick + ': </b>' + "</span>");
				$chat.append('<span class="timestamp"><b>' + time_string + "</span><br/>");
				$chat.append(data.msg + "<br/>") ;
				//$chat.val($chat.val()+'data.nick' +);
			});
			
			socket.on('whisper', function(data){
				$chat.append('<span class="whisper"><b>' + data.nick + ': </b>' + data.msg + "</span><br/>");
			});

			
			socket.on('usernames', function(data){
				var html = '';
				for(i=0; i < data.length; i++){
					html += " " + data[i] + '<br/>'
				}
				$users.html(html);
			});
			});