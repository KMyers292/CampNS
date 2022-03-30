//===============================================================================================//
//                            Controller For The Campground Route                                //
//===============================================================================================//

const Campground = require('../models/campground');
const catchAsync = require('../utilities/catchAsync');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const {getWeather} = require('../public/javascripts/weather');
const {searchByLocation} = require('../public/javascripts/yelpSearch');

//===============================================================================================//

// Renders the index.ejs page.
module.exports.index = catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
});

//===============================================================================================//

// Renders the new.ejs page.
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

//===============================================================================================//

// Sends the post request to create a new campground.
module.exports.createCampground = catchAsync(async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map((file) => ({url: file.path, filename: file.filename}));
    campground.author = req.user._id;
    campground.date = new Date().toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
    await campground.save();
    req.flash('success', 'Campground Successfully Created!');
    res.redirect(`/campgrounds/${campground._id}`);
});

//===============================================================================================//

// Renders the show.ejs page.
// Fetches the current weather for that campground.
// Fetches nearby businesses for that campground.
module.exports.showCampground = catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if(!campground) {
        req.flash('error', 'Campground Not Found!');
        return res.redirect('/campgrounds');
    }

    const camp = await getWeather(campground.geometry.coordinates[1], campground.geometry.coordinates[0]);

    campground.weather.current.description = camp.current.weather[0].main;
    campground.weather.current.temp = camp.current.temp;
    campground.weather.current.feelsLike = camp.current.feels_like;

    // Index of 0 is the current day, so it's skipped.
    for(let i = 1; i < camp.daily.length; i++) {
        const dateUnix = camp.daily[i].dt * 1000;
        const newDate = new Date(dateUnix).toLocaleDateString(undefined, {month: 'long', day: 'numeric'});

        const newForecast = {
            date: newDate,
            description: camp.daily[i].weather[0].main,
            min: camp.daily[i].temp.min,
            max: camp.daily[i].temp.max,
        }

        campground.weather.forecast.push(newForecast);
    }

    const nearby = await searchByLocation(campground.geometry.coordinates[1], campground.geometry.coordinates[0]);

    for(let business of nearby.businesses) {
        const newBusiness = {
            name: business.name,
            price: business.price,
            imageURL: business.image_url,
            category: business.categories[0].title,
            rating: business.rating,
            distance: business.distance,
            url: business.url
        }

        campground.businesses.push(newBusiness);
    }

    res.render('campgrounds/show', {campground});
});

//===============================================================================================//

// Renders the edit.ejs page.
module.exports.renderEditForm = catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if(!campground) {
        req.flash('error', 'Campground Not Found!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', {campground});
});

//===============================================================================================//

// Sends the put request to update a specific campground.
module.exports.updateCampground = catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map((file) => ({url: file.path, filename: file.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Campground Successfully Updated!');
    res.redirect(`/campgrounds/${campground._id}`);
});

//===============================================================================================//

// Sends the delete request to delete a speciic campground.
module.exports.deleteCampground = catchAsync(async (req, res) => {
    const { id } = req.params;

    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground Successfully Deleted!');
    res.redirect('/campgrounds');
});