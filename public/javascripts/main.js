		jQuery(function($){
            //alert('Page loaded');
			 var $ContactForm = $('#contactform');
			var $name_sender = $('#name');
			var $email_sender = $('#email');
			var $message= $('#message');
			var $formsubmit_button = $('#contact-submit');
			

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
			});