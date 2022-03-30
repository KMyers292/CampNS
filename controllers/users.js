//===============================================================================================//
//                                Controller For The Users Route                                 //
//===============================================================================================//

const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');

//===============================================================================================//

// Renders the register.ejs page.
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

//===============================================================================================//

// Sends the post request to create a new user.
// Then logs them in and returns them to the page they were previously on.
module.exports.register = catchAsync(async (req, res, next) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (error) => {
            if(error) {
                return next(error);
            }
            req.flash('success', 'Successfully Registered. Welcome to CampNS');
            res.redirect('/campgrounds');
        });
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('register');
    }
});

//===============================================================================================//

// Renders the login.ejs page.
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

//===============================================================================================//

// Sends the post request to login in a user.
// Returns them to the page they were previously on.
module.exports.login = (req, res) => {
    req.flash('success', `Welcome Back, ${req.body.username}!`);
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

//===============================================================================================//

// Logs out the current user and returns them to the /campgrounds route.
module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Successfully Logged Out. Goodbye!');
    res.redirect('/campgrounds');
};