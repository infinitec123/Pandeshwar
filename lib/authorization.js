var User = require('../models/user');

exports.isAuthenticated = function(req, res, next){
	if(req.isAuthenticated()){
		next();
	} else {
		res.redirect('/contact'); //to be changed to /contact
	}
}