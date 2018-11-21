var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');

var app = express();
/*
var logger = function(req, res, next) {
	console.log('Logging...');
	next();
}

app.use(logger);
*/
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({entended: false}));

//Set Static Path
app.use(express.static(path.join(__dirname, 'public')));

var users = [
	{
		id: 1,
		username: 'admin',
		password: 'admin',
		email: 'admin@gmail.com'
	}, 
	{
		id: 2,
		username: 'admin2',
		password: 'admin2',
		email: 'admin2@gmail.com'
	}, 
	{
		id: 3,
		username: 'admin3',
		password: 'admin3',
		email: 'admin3@gmail.com'
	}
]

app.get('/', function(req, res){
	res.render('index', {
		title: 'Customers',
		users: users
	});
});

app.post('/users/add', function(req, res){
	var newUser = {
		username: req.body.username,
		password: req.body.password,
		email: req.body.email
	}
	console.log(newUser);
	
});

app.listen(3000, function(){
	console.log()
})




