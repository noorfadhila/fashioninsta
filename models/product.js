var mongoose = require('mongoose');

//Product Schema
var productSchema = mongoose.Schema({
	imagePath:{
		type: String,
		required: true
	},
	title:{
		type: String,
		required: true
	},
	category:{
		type: String,
		required: true
	},
	description:{
		type: String,
		required: true
	},
	price:{
		type: Number,
		required: true
	}
});

var Product = module.exports = mongoose.model('Product', productSchema);