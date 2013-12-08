module.exports = {
	development: {
		db: 'mongodb://localhost/pandeshwar',
		app: {
			name: 'Pandeshwar'
		},
		facebook: {
			clientID: "587869427929487",
			clientSecret: "86a7f894441c1d939dd798a809bd295b",
			callbackURL: "http://localhost:3000/auth/facebook/callback"
		}
	},
  	production: {
    	db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL,
		app: {
			name: 'Pandeshwar'
		},
		facebook: {
			clientID: "587869427929487",
			clientSecret: "86a7f894441c1d939dd798a809bd295b",
			callbackURL: "http://pandeshwar.herokuapp.com/auth/facebook/callback"
		}
 	}
}
