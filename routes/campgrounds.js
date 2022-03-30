//===============================================================================================//
//                              Express Router routes for campgrounds.                           //
//===============================================================================================//

const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const { isLoggedIn, validateCampground, isCampgroundAuthor } = require('../middleware');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});

//===============================================================================================//

// /campgrounds/
router.route('/')
    // Route for rendering all campgrounds.
    .get(campgrounds.index)
    // Route for creating a new campground made from the rendered form.
    .post(isLoggedIn, upload.array('image'), validateCampground, campgrounds.createCampground);

//===============================================================================================//

// /campgrounds/new
// Route for rendering the form to creae new campgrounds.
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

//===============================================================================================//

// /campgrounds/:id
router.route('/:id')
    // Route for rendering a specific campground based on id.
    .get(campgrounds.showCampground)
    // Route for editing a specific campground based on info from the rendered form.
    .put(isLoggedIn, isCampgroundAuthor, upload.array('image'), validateCampground, campgrounds.updateCampground)
    // Route for deleting a specific campground based on id.
    .delete(isLoggedIn, isCampgroundAuthor, campgrounds.deleteCampground);

//===============================================================================================//

// /campgrounds/:id/edit
// Route for rendering the form to edit a specific campground based on id.
router.get('/:id/edit', isLoggedIn, isCampgroundAuthor, campgrounds.renderEditForm);

//===============================================================================================//

module.exports = router;