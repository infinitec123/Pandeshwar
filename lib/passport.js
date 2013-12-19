var mongoose = require('mongoose'),
    FacebookStrategy = require('passport-facebook').Strategy,
    User = mongoose.model('User')
    ;

module.exports = function(passport, config){
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		User.findOne({_id: id}, function(err, user){
			done(err, user);
		});
	});

	passport.use(new FacebookStrategy({
		clientID: config.facebook.clientID,
		clientSecret: config.facebook.clientSecret,
		callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
    	//console.log("User Name in middleware was::" + profile.displayName);
    	//Calling done here can eliminate saving the data :: done(profile)
    	User.findOrCreateFaceBookUser(profile, done);
    }));
}