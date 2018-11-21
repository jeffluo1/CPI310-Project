var express = require("express");
var router = express.Router();
var mongo = require('mongodb');
var assert = require('assert');
var app = express();
var port = 3000;
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//HOMEPAGE, DEFAULT PATH
app.use(express.static(__dirname));

//SETUP DATABASE
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/CPI310");

//CREATING POST FIELDS
var postSchema = new mongoose.Schema({
    postTitle: String,
    postContent: String
});

var post = mongoose.model("Post", postSchema);

//Commented out default path
/*
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/create-post.html");
});
*/

app.get('/template', function(req, res){
	post.find({}, function(err, docs){
		if(err) res.json(err);
		else	res.render('index', {posts: docs});
	});
	
	/*
	mongo.connect(url, function(err, db) {
		var postArray = [];
		assert.equal(null,error);
		var cursor = db.collection('post-data').find();
		cursor.forEach(function(doc, err){
			assert.equal(null, err);
			postArray.push(doc);
		}, function(){
			db.close();
			res.render('template', {posts: postArray})
		});
	});
	*/
});

//POST SAVES TO DATABASE
app.post("/addPost", (req, res) => {
	new post({
		postTitle: req.body.postTitle,
		postContent: req.body.postContent
	}).save(function(err,doc){
		if(err) res.json(err);
		else	res.redirect('template');
	})


	res.redirect('template.html');

	mongo.connect(url, function(err, db) {
		assert.equal(null, err);
		db.collection('post-data').insertOne(post, function(err, result) {
			assert.equal(null, err);
			console.log('Post inserted');
			db.close();
		});
	});
	/*
    const post = new Post(req.body);
	post.save()
        .then(item => {
			res.send("Post Created, Redirecting Shortly");
			console.log(post);
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
	});
	*/
});

app.listen(port, () => {
    console.log("Server listening on port " + port);
});