//===============================================================================================//
//                                Mongoose Campground Schema                                     //
//===============================================================================================//

const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const opts = { toJSON: {virtuals: true} };

//===============================================================================================//

// Mongoose schema for campground images.
const ImageSchema = new Schema({
    url: String,
    filename: String
});

//===============================================================================================//

// Creates a virtual schema for providing thumbnail sized images for campgrounds.
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

//===============================================================================================//

// Mongoose schema for a campground model.
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    phone: String,
    date: String,
    weather: {
        current: {
            description: String,
            temp: Number,
            feelsLike: Number,
        },
        forecast: [{
            date: String,
            description: String,
            min: Number,
            max: Number
        }]
    },
    businesses: [{
        name: String,
        price: String,
        imageURL: String,
        category: String,
        rating: Number,
        distance: Number,
        url: String
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // Stores all the reviews for a particular campground.
    reviews: [
        {
            // ObjectId from a review model.
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
}, opts);

//===============================================================================================//

// Creates a virtual schema for getting just the id and title from campground schema.
// Used for updating mapbox location markers.
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>`
});

//===============================================================================================//

// Middleware that deletes a campground from a campground id and deletes all reviews associated.
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if(doc) {
        await Review.deleteMany({
            // Deletes all reviews where _id field is in the reviews array in doc.
            _id: {
                $in: doc.reviews
            }
        });
    }
});

//===============================================================================================//

module.exports = mongoose.model('Campground', CampgroundSchema);