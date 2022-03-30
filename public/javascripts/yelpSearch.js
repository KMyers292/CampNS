const fetch = require('node-fetch');
const yelpKey = process.env.YELP_KEY;
const header = {Authorization: `Bearer ${yelpKey}`};

module.exports.searchByLocation = async (lat, long) => {
    const response = await fetch(`https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${long}&limit=4&radius=20000`, {
        headers: header
    });
    const jsonResponse = await response.json();

    return jsonResponse;
};