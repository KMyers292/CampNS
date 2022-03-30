//===============================================================================================//
//                              Express Router routes for users.                                 //
//===============================================================================================//

const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');

//===============================================================================================//

router.route('/register')
    // Route for rendering the form to register a new user.
    .get(users.renderRegister)
    // Route for creating a new user made from the rendered form.
    .post(users.register);

//===============================================================================================//

router.route('/login')
    // Route for rendering the form to login a user.
    .get(users.renderLogin)
    // Route for logging in a user from the rendered form.
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login);

//===============================================================================================//

// Route for logging out a currently signed in user.
router.get('/logout', users.logout);

//===============================================================================================//

module.exports = router;