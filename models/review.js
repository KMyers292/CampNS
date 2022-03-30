//===============================================================================================//
//                                   Mongoose Review Schema                                      //
//===============================================================================================//

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//===============================================================================================//

// Mongoose schema for a model for reviewing individual campgrounds.
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

//===============================================================================================//

module.exports = mongoose.model('Review', reviewSchema);