module.exports = function(app, passport) {
    
        // =====================================
        // home
        // =====================================
        app.get('/', function(req, res) {
            res.render('index.ejs'); // load the index.ejs file
        });
    
        // =====================================
        // login
        // =====================================
        // show the login form
        app.get('/login', function(req, res) {
    
            // render the page and pass in any flash data if it exists
            res.render('login.ejs', { message: req.flash('loginMessage') }); 
        });
    
        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
    
        // =====================================
        // signup
        // =====================================
        // show the signup form
        app.get('/signup', function(req, res) {
    
            // render the page and pass in any flash data if it exists
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });
    
        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
    
        // =====================================
        // profile
        // =====================================
        // we will want this protected so you have to be logged in to visit
        // we will use route middleware to verify this (the isLoggedIn function)
        app.get('/profile', isLoggedIn, function(req, res) {
            res.render('profile.ejs', {
                user : req.user // get the user out of session and pass to template
            });
        });
    
        
        app.get('/logout', function(req, res) {
            req.logout();
            res.redirect('/');
        });

        // =====================================
        // EXAMPLE PAGE =====================
        // =====================================
        // we will want this protected so you have to be logged in to visit
        // we will use route middleware to verify this (the isLoggedIn function)
        app.get('/example', isLoggedIn, function(req, res) {
            res.render('example.ejs', {
                user : req.user // get the user out of session and pass to template
            });
        });

        // =====================================
        // GOOGLE
        // =====================================
        // send to google to do the authentication
        // profile gets us their basic information including their name
        // email gets their emails
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
        
            // the callback after google has authenticated the user
            app.get('/auth/google/callback',
                    passport.authenticate('google', {
                            successRedirect : '/profile',
                            failureRedirect : '/'
                }));



    };
    
    // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {
    
        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated())
            return next();
    
        // if they aren't redirect them to the home page
        res.redirect('/');
    }
    
    