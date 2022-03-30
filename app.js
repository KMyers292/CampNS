// Add data from .env into process.env file if in development mode.
if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

//===============================================================================================//

const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const ExpressError = require('./utilities/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/camp-ns-db';
const secret = process.env.SECRET || 'thisisasecret';

//===============================================================================================//

// Connects to the Mongo Database either through the cloud using .env DB_URL, or locally if in local development.
// 'mongodb://localhost:27017/camp-ns-db' is the local database for local development purposes.
// If using local database, start up local mondodb server first.
mongoose.connect(dbUrl)
    .catch((error) => { 
        console.log(`Error On Initial Connection: ${error}`); 
    });

// Handles if there is an error after initial connection to database.
// As well as log to the console a message if connection to database is successful.
mongoose.connection.on('error', (error) => { console.log(`Connection Error: ${error}`); });
mongoose.connection.once('open', () => { console.log('Database Connected'); });

//===============================================================================================//

// Set the default template engine to "ejs".
// Prevents the need for using file extensions when calling files.
// EjsMate allows the creation of templates for ejs files .
// To connect partial ejs files like a navbar to other files.
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//===============================================================================================//

// Parses incoming requests with urlencoded payloads, based on body-parser.
app.use(express.urlencoded({extended: true}));

// Allows use of methods in areas where it's not allowed.
// Used for having HTTP verbs in a form where not normally allowed, like a PUT request.
app.use(methodOverride('_method'));

// Sets up middleware to serve static files in the public directory.
app.use(express.static(path.join(__dirname, 'public')));

// Sets up middleware to prevent mongo sql injection
// Replaces sql reserved symbols with an underscore.
app.use(mongoSanitize({replaceWith: '_'}));

// Creates a store for storing session information in the Mongo database.
// Updates session information every 24 hours, based on 'touchAfter'.
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});

// Logs an error message in the console if there is an issue with storing the session.
store.on('error', (error) => {
    console.log("Session Store Error", error);
});

// Configuration settings for implementing a session.
const sessionConfig = {
    store: store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// Middleware for implementing a session.
app.use(session(sessionConfig));

// Middleware for displaying messages to the user after hitting certain routes/redirects.
// Uses the request body to send messages.
app.use(flash());

// Middleware to help secure Express apps by setting various HTTP headers.
// 'contentSecurityPolicy' was set to false because of conflict with mapbox.
app.use(helmet({contentSecurityPolicy: false}));

// Provides authentication middleware used to authenticate certain requests.
// Initializes passport and sets up the users session.
app.use(passport.initialize());
app.use(passport.session());

// Provides passports LocalStrategy with the authenticate method in the User schema from passport-local-mongoose.
passport.use(new LocalStrategy(User.authenticate()));

// Provides passport with the methods to store and remove a user from the session. Log in and Log out.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Provides access for using the flash data in each local route response.
// Allows access to the current logged in user in the route response.
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Routes for campgrounds, reviews, and users using Express Router routes.
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes); 
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Route for viewing the homepage.
app.get('/', (req, res) => {
    res.render('home');
});

// Route that is reached if no routes are hit and calls an error.
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Route to send users to when CatchAsync catches an error.
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) {
        err.message = 'Something Went Wrong!';
    }
    res.status(statusCode).render('error', {err});
});

// Starts server on heroku's port or port 3000 if local.
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});