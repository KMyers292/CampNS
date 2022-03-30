const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

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

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    req.flash('success', `Welcome Back, ${req.body.username}!`);
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Successfully Logged Out. Goodbye!');
    res.redirect('/campgrounds');
};