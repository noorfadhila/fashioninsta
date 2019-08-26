var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs'); 

//Product Schema
var userSchema = new mongoose.Schema({
	name:{
		type: String,
		required: false
	},
	phone:{
		type: String,
		required: false
	},
	email:{
		type: String,
		required: true
	},
	password:{
		type: String,
		required: true
	}
});

//encript the password with encryptPassword method
userSchema.methods.encryptPassword = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

//to check same password from current password
userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
}

var User = module.exports = mongoose.model('User', userSchema);