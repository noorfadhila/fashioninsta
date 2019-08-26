var express = require('express');
var router = express.Router();

//GET HOMEPAGE
router.get('/', function(req, res, next){
	res.render('index', {
				title: 'FashionInsta',
				products: products
			});

	module.exports = router;
})