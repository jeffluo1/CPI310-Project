var express = require("express");
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
mongoose.connect("mongodb://localhost:27017/node-demo");
var postSchema = new mongoose.Schema({
    postTitle: String,
    postContent: String
});
var newPost = mongoose.model("Post", postSchema);

//Commented out default path
/*
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/create-post.html");
});
*/

//POST SAVES TO DATABASE
app.post("/addPost", (req, res) => {
    var myData = new newPost(req.body);
    myData.save()
        .then(item => {
            res.send("Post Created, Redirecting Shortly");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

app.listen(port, () => {
    console.log("Server listening on port " + port);
});