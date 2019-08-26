var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var csrf = require('csurf');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);


var csrfProtection = csrf(); //protection middleware

//connect to database
mongoose.connect('mongodb://localhost/fashioninsta');
require ('./config/passport');
var db = mongoose.connection;


//init app 
var app = express();

//bring model
var Product = require('./models/product');
var Cart = require('./models/cart');
var User = require('./models/user');
// var Passport = return ('./config/passport');

// //check connection
// db.once('open', function(){
// 	console.log('connected to MongoDB');
// });

// // //check for DB errors
// db.on('error', function(err){
// 	console.log(err);
// });


//Load view Engine
app.set('views', path.join(__dirname, 'views')); //folder 'views' will capture template
app.set('view engine', 'pug');

//Body Parser Middleware
//parse application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(validator());
//to sercure the session
//resave: true (default) will save session in browser
//Uninitialized: true (default) will save session in server
app.use(session({
	secret: 'thisissecret', 
	resave: false, 
	saveUninitialized: false,
	store: new MongoStore({ mongooseConnection: mongoose.connection }),
	cookie: { maxAge: 180 * 60 * 1000 }
}));

app.use(flash())
app.use(passport.initialize());
app.use(passport.session());
//set PUBLIC folder - treated as statif folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
	res.locals.login = req.isAuthenticated();
	res.locals.session = req.session;
	next();
});

app.use(csrfProtection);

/*-------------------
|   START SERVER    |
---------------------*/
app.listen(3000, function(){
	console.log('Server started on port 3000...')
});

/*-------------------
|   PROFILE ROUTE    |
---------------------*/


app.get('/user/profile', isLoggedIn, function(req, res, next){
	res.render('user/profile');
});

app.get('/user/logout', isLoggedIn, function(req, res, next){
	req.logout();
	res.redirect('/');
});

// app.use('/', notLoggedIn, function(req, res, next){
// 	next()
// });

/*-------------------
|     HOME ROUTE    |
---------------------*/

app.get('/', function(req, res, next){
	Product.find({}, function(err, products){
		// var productChunks = [];
		// var chunkSize = 3;
		// for (var i = 0; i < docs.length; i += chunkSize){
		// 	productChunks.push(docs.slice(i, i + chunkSize));
		// }
		// res.render('/', {title: 'Shopping Cart', products: productChunks});
		if(err){
			console.log(err);
		}else{
			res.render('index', { //render view
				title: 'FashionInsta',
				products: products
			});
		}
	});
});

/*-------------------
|   SIGN-UP ROUTE    |
---------------------*/

//VIEW
app.get('/user/signup', function(req, res, next){
	var messages = req.flash('error');
	//res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
	res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

//POST
//local.signup from passport.js.
app.post('/user/signup', passport.authenticate('local.signup',{ 
	successRedirect:'/user/profile',
	failureRedirect: '/user/signup',
	failureFlash: true
}));

/*-------------------
|   SIGN-IN ROUTE    |
---------------------*/

//view
app.get('/user/signin', function(req, res, next){
	var messages = req.flash('error');
	res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

app.post('/user/signin', passport.authenticate('local.signin', {
	successRedirect:'/user/profile',
	failureRedirect: '/user/signin',
	failureFlash: true
}));

app.get('/user/profile/:id', isLoggedIn, function(req, res, next){
	User.findById(req.params.id, function(err, user){
		res.render('user', {
			user.user
		});
	});
});

/*-------------------
|   CHECK LOGGED-IN  |
---------------------*/

function isLoggedIn(req, res, next){
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}

function notLoggedIn(req, res, next){
	if (!req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}

/*-------------------
|    ADD TO CART    |
---------------------*/

app.get('/addtocart/:id', function(req, res, next){
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {items: {}});

	Product.findById(productId, function(err, product){
		if (err){
			return res.redirect('/');
		}
		cart.add(product, product.id);
		req.session.cart = cart;
		console.log(req.session.cart);
		res.redirect('/');
	})
});

/*-------------------
|SHOPPING-CART ROUTE  |
---------------------*/

app.get('/shopping-cart', function(req, res, next){
	if(!req.session.cart){
		return res.render('cart', {products:null});
	}
	var cart = new Cart(req.session.cart);
	res.render('cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

app.get('/reduce/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

/*-------------------
|   PRODUCT ROUTE    |
---------------------*/
//get View
app.get('/product/add', function(req, res){
	res.render('add_product', {
		title:'Product'
	});
});

//Add/POST Submit Product to Database 
app.post('/product/add', function(req,res){
	let product = new Product() //Product is model
	product.imagePath = req.body.imagePath;
	product.title = req.body.title;
	product.category = req.body.category;
	product.description = req.body.description;
	product.price = req.body.price;
	

	product.save(function(err){
		if(err){
			console.log(err);
			return;
		}else{
			res.redirect('/');
		}
	});
});



