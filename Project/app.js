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

const sqlite = require('sqlite');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const cookieParser = require('cookie-parser')

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'twig');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.disable('view cache');
const saltRounds = 10;
const dbPromise = sqlite.open('./data.db');

dbPromise.then(async (db) => {
    await db.run('CREATE TABLE IF NOT EXISTS messages ( id INTEGER PRIMARY KEY, author STRING, message STRING );');
    await db.run('CREATE TABLE IF NOT EXISTS users ( id INTEGER PRIMARY KEY, email STRING, passwordHash STRING );');
    await db.run('CREATE TABLE IF NOT EXISTS sessions ( id INTEGER PRIMARY KEY, userid INTEGER, sessionToken STRING );');
});

//asdf
const authorize = async (req, res, next) => {
    // const { sessionToken } = req.cookies;
    const db = await dbPromise;
    const sessionToken = req.cookies.sessionToken;
    if(!sessionToken) {
        next();
        return;
    };
    const user = await db.get('SELECT users.email, users.id as id FROM sessions LEFT JOIN users ON sessions.userid = users.id WHERE sessionToken=?', sessionToken);
    if(!user) {
        next();
        return;
    };
    console.log('logged in', user.email);
    req.user = user;
    next();
    return;
};

const requireAuth = (req, res, next) => {
    if (!req.user) {
        res.status(401).send('please log in');
        return;
    }
    next();
};

app.use(authorize);

app.get('/', async (req, res) => {
    const db = await dbPromise;
    const messages = await db.all('SELECT * FROM messages;');
    const user = req.user;
    res.render('index',{ messages, user });
});

app.get('/login', async (req, res) => {
    if (req.user) {
        res.redirect('/');
        return;
    }
});

app.get('/register', async (req, res) => {
    if (req.user) {
        res.redirect('/');
        return;
    }
    res.render('register');
});

app.post('/message', requireAuth, async (req, res) => {
    const db = await dbPromise;
    await db.run('INSERT INTO messages (author, message) VALUES (?, ?)', req.user.email.split('@')[0], req.body.message);
    res.redirect('/');
});

app.post('/register', async (req, res) => {
    const db = await dbPromise;
    const user = await db.get('SELECT * FROM users WHERE email=?', req.body.email);
    if (user) {
        res.status(400).render('register', { registerError: 'account already exists' });
        return;
    }
    const passwordHash = await bcrypt.hash(req.body.password, saltRounds);
    await db.run(
        'INSERT INTO users (email, passwordHash)  VALUES (?, ?);',
        req.body.email,
        passwordHash
    );
    const newUser = db.get('SELECT id, email FROM users WHERE email=?', req.body.email);
    const sessionToken = uuidv4();
    await db.run(
        'INSERT INTO sessions (userid, sessionToken) VALUES (?, ?);',
        newUser.id,
        sessionToken
    );
    res.cookie('sessionToken', sessionToken);
    res.redirect('/');
});

app.post('/login', async (req, res) => {
    const db = await dbPromise;
    const user = await db.get('SELECT * FROM users WHERE email=?', req.body.email);
    if (!user) {
        { loginError: 'email or password is incorrect' };
        return;
    }
    const passwordMatches = await bcrypt.compare(req.body.password, user.passwordHash);
    if (passwordMatches) {
        const sessionToken = uuidv4();
        await db.run('INSERT INTO sessions (userid, sessionToken) VALUES (?, ?);', user.id, sessionToken);
        res.cookie('sessionToken', sessionToken);
        res.redirect('/');
    } else {
        { loginError: 'email or password is incorrect' };
    }
})

app.get('/logout', async (req, res) => {
    const db = await dbPromise;
    res.cookie('sessionToken', '', { maxAge: 0 });
    await db.run('DELETE FROM sessions WHERE sessionToken=?', req.cookies.sessionToken);
    res.redirect('/');
})

app.get('/databasedump', async (req, res) => {
    const db = await dbPromise;
    const tables = await db.all('SELECT name FROM sqlite_master WHERE type="table"');
    const users = await db.all('SELECT * FROM users');
    const messages = await db.all('SELECT * FROM messages');
    const sessions = await db.all('SELECT * FROM sessions');
    res.json({
        tables,
        users,
        messages,
        sessions
    })
})

app.use((req, res) => {
    res.status(404).send('file not found');
})


app.listen(port, () => {
    console.log("Server listening on port " + port);
});