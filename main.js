const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser')
const session = require('express-session');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// change this to an environment variable, DEV ONLY PLEASE
app.use(session({secret: 'Vitaliy', resave: false, saveUninitialized: false, cookie: {secure: false}}));

// sets the public folder
app.use(express.static('public'));

// set pug as the html templater
app.set('view engine', 'pug');

// MUST BE FIRST
// allow socketio to be accessable in the sub routers by putting it in the req
app.use(function(req,res,next){
    req.io = io;
    next();
});

// auth router
app.get('/', function(req, res, next) {
    if (!req.session.authed) {
        res.sendFile(__dirname + "/static/landing.html");
    }
    else{
        res.redirect("/ptable");
    }
});

// login router
var loginRouter = require("./routes/login.js");
app.use('/', loginRouter);

// Authentication checker
// This router is generic and must be first after login to function properly
app.get('*', function (req, res, next) {
    if (!req.session.authed) {
        res.redirect('/');
        console.log("Not Authed, sending to home");
    }
    else {
        next();
    }
});

// periodic table router
var pTableRouter = require("./routes/periodicTable.js");
app.use('/ptable', pTableRouter);

// calc router
var calc = require("./routes/calc.js");
app.use('/', calc);

// 404 Router
// This is a generic router and must be last in the list to funtion correctly
app.use(function(req, res) {
    res.render("error", {text:"404 Page Not Found"});
});

// socketio listen
io.on('connection', function(socket){
  console.log('a user connected');
});

// Open the server on port 3000
http.listen(3000, function(){
  console.log('listening on *:3000');
});
