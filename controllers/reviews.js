//===============================================================================================//
//                                Controller For The Review Route                                //
//===============================================================================================//

const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utilities/catchAsync');

//===============================================================================================//

// Sends the post request to create a new review.
module.exports.createReview = catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;

    campground.reviews.push(review);
    await review.save();
    await campground.save();

    req.flash('success', 'Review Successfully Created!');
    res.redirect(`/campgrounds/${campground._id}`);
});

//===============================================================================================//

// Deletes the selected review from the campground and review schema.
module.exports.deleteReview = catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    // $pull is mongoDB function that removes from an existing array all instances of a value that matches what's passed in.
    // Removes a review from the reviews array where reviewId matches.
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Review Successfully Deleted!');
    res.redirect(`/campgrounds/${id}`);
});