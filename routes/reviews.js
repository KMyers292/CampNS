//===============================================================================================//
//                                 Express Router routes for reviews.                            //
//===============================================================================================//

const express = require('express');
const router = express.Router({mergeParams: true});
const reviews = require('../controllers/reviews');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');

//===============================================================================================//

// /campgrounds/:id/reviews/
// Route for creating a new review for a specific campground.
router.post('/', isLoggedIn, validateReview, reviews.createReview);

//===============================================================================================//

// /campgrounds/:id/reviews/:reviewId
// Route for deleting a specific review of a specific campground.
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, reviews.deleteReview);

//===============================================================================================//

module.exports = router;