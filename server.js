/******************************
=============Setup=============
*******************************/
var multer  = require('multer')
// var upload = multer({ dest: 'uploads/' }).single('theImage')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)

    cb(null, new Date().toISOString() + file.originalname)
  }
})

var upload = multer({ storage: storage })

var express = require('express')
var app     = express()

require('dotenv').config()

const MongoClient = require('mongodb').MongoClient
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
// var uniqid  = require('uniqid')
var ObjectId = require('mongodb').ObjectID
var morgan       = require('morgan');
var bodyParser   = require('body-parser')
var session      = require('express-session');

const DB_NAME = process.env.DB_NAME
const DB_URL =process.env.DB_URL+`/${DB_NAME}`
const PORT = process.env.PORT || 3000
// console.log(`*********URL : ${DB_URL}`)
var db


/******************************
=========Mongo Config=========
*******************************/
mongoose.connect(DB_URL, (err, database) => {
  if (err) return console.log(err)
  db = database
  require('./app/routes.js')(app, db, passport, ObjectId, upload);
});

require('./config/passport')(passport); // pass passport for configuration

/******************************
=========Express Setup=========
*******************************/

app.use(express.static('public'))
app.use('/uploads' ,express.static('uploads'))
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

/******************************
=========Passport Setup=========
*******************************/
// required for passport
app.use(session({
    secret: 'whatsThisFor', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// launch ======================================================================
app.listen(PORT);
console.log('The magic happens on port ' + PORT);
