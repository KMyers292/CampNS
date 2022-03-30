// Add data from .env into process.env file if in development mode.
if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
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

// 'mongodb://localhost:27017/camp-ns-db' is the local database for testing purposes.
// If using local database, start up mondodb server first.
mongoose.connect(dbUrl)
    .catch((error) => { console.log(`Error On Initial Connection: ${error}`); });

// Handles if there is an error after initial connection.
// As well as log to the console a message if connection is successful.
mongoose.connection.on('error', (error) => { console.log(`Connection Error: ${error}`); });
mongoose.connection.once('open', () => { console.log('Database Connected'); });

// Set the default template engine to "ejs".
// Which prevents the need for using file extensions.
// EjsMate allows the creation of templates for ejs files.
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parses incoming requests.
app.use(express.urlencoded({extended: true}));
// Middleware to use methods in areas where it's not allowed.
// Used for having different HTTP verbs in a form.
app.use(methodOverride('_method'));

// Sets up middleware to serve static files in the public directory.
app.use(express.static(path.join(__dirname, 'public')));

// Sets up middleware to prevent mongo sql injection.
app.use(mongoSanitize({replaceWith: '_'}));

const secret = process.env.SECRET || 'thisisasecret';

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});

store.on('error', function(e){
    console.log("Session Store Error", e);
});

// Middleware for handling cookies as well as configuration settings for the session.
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
app.use(session(sessionConfig));

// Middleware for displaying messages to the user after hitting certain routes/redirects.
app.use(flash());

app.use(helmet({contentSecurityPolicy: false}));

// Initializes passport and sets up the users session.
app.use(passport.initialize());
app.use(passport.session());

// Provides passports LocalStrategy with the authenticate method in the User schema from passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));

// Provides passport with the methods to store and remove a user from the session. Log in and Log out.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Provides access for using the flash data in each local route response.
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

const port = process.env.PORT || 3000;

// Starts server on heroku's port or port 3000 if local.
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});