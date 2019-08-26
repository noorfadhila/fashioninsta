var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

//tell passport store user in the session
passport.serializeUser(function(user, done){
	done(null, user.id); //store user in session serialize by id.
});

passport.deserializeUser(function(id, done){
	User.findById(id, function(err, user){
		done(err, user);
	});
});

//middleware
//LocalStrategy(configuration, callback) to make new user
passport.use('local.signup', new LocalStrategy({
	usernameField:'email',
	passwordField:'password',
	passReqToCallback: true
}, function(req, email, password, done){ 
	req.checkBody('email', 'Invalid email').notEmpty().isEmail();
	req.checkBody('password', 'Invalid password').notEmpty().isLength({min:4});
	var errors = req.validationErrors();
	if (errors){
		var messages = [];
		errors.forEach(function(error){
			messages.push(error.msg);
		});
		return done(null, false, req.flash('error', messages));
	}
	User.findOne({'email': email}, function(err, user){ //to find user if exist
		if(err){
			return done(err);
		}
		if (user){
			return done(null, false, {message: 'Email is already in use.'});
		}
		//if not error and user not exist, then:
		var newUser = new User();
		newUser.email = email;
		newUser.password = newUser.encryptPassword(password); //method from models/user.js
		newUser.save(function(err, result){
			if (err){
				return done(err);
			}
			return done(null, newUser); //no error wil create user
		});
	});
}));


passport.use('local.signin', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
}, function(req, email, password, done){
	req.checkBody('email', 'Invalid email').notEmpty().isEmail();
	req.checkBody('password', 'Invalid password').notEmpty();
	var errors = req.validationErrors();
	if (errors){
		var messages = [];
		errors.forEach(function(error){
			messages.push(error.msg);
		});
		return done(null, false, req.flash('error', messages));
	}
		User.findOne({'email': email}, function(err, user){ //to find user if exist
		if(err){
			return done(err);
		}
		if (!user){
			return done(null, false, {message: 'No user found!'});
		}
		if (!user.validPassword(password)) {
			return done(null, false, {message: 'Wrong Password'});
		}
		return done(null, user);
	});
}));

