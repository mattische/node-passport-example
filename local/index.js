//port number. If not set as an envrionment var 8181 is used
var port = process.env.PORT || 8181;

//logging
var morgan = require('morgan');


//mongoDb ORM
var mongoose = require('mongoose');
var configDB = require('./config/mongodb.js');//mongoDb connection string
mongoose.connect(configDB.url);
// load up the user model
var User = require('./models/user');

///////////////////////////////////////////////////////////////////////////////////////////
// PASSPORT
//////////////////////////////////////////////////////////////////////////////////////////
var passport = require('passport');
var LocalStrategy   = require('passport-local').Strategy;
// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
},
function(req, email, password, done) { // callback with email and password from our form

    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    User.findOne({ 'local.email' :  email }, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err)
            return done(err);

        // if no user is found, return the message
        if (!user)
            return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

        // if the user is found but the password is wrong
        if (!user.validPassword(password))
            return done(null, false, req.flash('loginMessage', 'Wrong password.')); // create the loginMessage and save it to session as flashdata

        // all is well, return successful user
        return done(null, user);
    });

}));

passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
},
function(req, email, password, done) {

    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function() {

    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    User.findOne({ 'local.email' :  email }, function(err, user) {
        // if there are any errors, return the error
        if (err)
            return done(err);

        // check to see if theres already a user with that email
        if (user) {
            return done(null, false);
        } else {

            // if there is no user with that email
            // create the user
            var newUser            = new User();

            // set the user's local credentials
            newUser.local.email    = email;
            newUser.local.password = newUser.generateHash(password);

            // save the user
            newUser.save(function(err) {
                if (err)
                    throw err;
                return done(null, newUser);
            });
        }

        });    

    });

}));

//sessions
var session = require("express-session");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

var express = require("express");
var app = express();

//log every request to console
app.use(morgan('dev'));

app.set('view engine', 'ejs'); // set up ejs for templating

app.use(express.static("public"));
app.use(session({ secret: "aVerySecretSecret" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(passport.initialize());
app.use(passport.session());


app.get('/', function(req, res) {
    res.render('index.ejs'); // load the index.ejs file
});

app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs'); 
});

app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login' // redirect back to the signup page if there is an error
}));

app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
        user : req.user // get the user out of session and pass to template
    });
});

app.get('/signup', function(req, res) {
    res.render('signup.ejs');
});
    
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.get("/example", isLoggedIn, function(req, res) {
    res.render("example.ejs", { user: req.user });
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

// launch ======================================================================
app.listen(port);
console.log('Serving on port ' + port);
