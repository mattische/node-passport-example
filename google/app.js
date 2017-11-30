//port number. If not set as an envrionment var 8080 is used
var port = process.env.PORT || 8080;

//for flash messages.
var flash = require('connect-flash');
//logging
var morgan = require('morgan');

//Passport
var passport = require('passport');
require('./passport/local')(passport); // pass passport for configuration
require('./passport/google')(passport); // pass it

//mongoDb ORM
var mongoose = require('mongoose');
var configDB = require('./config/mongodb.js');//mongoDb connection string
mongoose.connect(configDB.url);

//sessions
var session = require("express-session");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

var express = require("express");
var app = express();

//log every request to console
app.use(morgan('dev'));
app.use(flash());

app.set('view engine', 'ejs'); // set up ejs for templating

app.use(express.static("public"));
app.use(session({ secret: "aVerySecretSecret" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(passport.initialize());
app.use(passport.session());


require('./routes/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
app.listen(port);
console.log('Serving on port ' + port);
