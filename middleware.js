//===============================================================================================//
//                              Middleware Functions For Routes                                  //
//===============================================================================================//

const Campground = require('./models/campground'); // Campground mongoose schema.
const Review = require('./models/review'); // Review mongoose schema.
const { campgroundSchema, reviewSchema } = require('./joiSchemas'); // Campground and Review Joi schemas.
const ExpressError = require('./utilities/ExpressError'); // Error handler class for catching errors.

//===============================================================================================//

// Middleware for checking if the user is logged in.
// If not, do not give them permission to create, update, or delete campgrounds or reviews.
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You Must Be Signed In');
        return res.redirect('/login');
    }

    next();
};

//===============================================================================================//

// Middleware for validating the form submissions for creating campgrounds using Joi.
module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);

    if(error) {
        const msg = error.details.map((element) => element.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
};

//===============================================================================================//

// Middleware for validating the form submissions for creating reviews using Joi.
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);

    if(error) {
        const msg = error.details.map((element) => element.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
};

//===============================================================================================//

// Middleware for checking if a specific campground is owned by the current logged in user.
// If not, does not give them permissin to edit or delete that campground.
module.exports.isCampgroundAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that action.');
        return res.redirect(`/camgrounds/${id}`);
    }
    else {
        next();
    }
};

//===============================================================================================//

// Middleware for checking if a specific review is owned by the current logged in user.
// If not, does not give them permissin to delete that review.
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if(!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that action.');
        return res.redirect(`/camgrounds/${id}`);
    }
    else {
        next();
    }
};

//===============================================================================================//