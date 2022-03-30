//===============================================================================================//
//                        Allows The Use Of Openweathermap's weather API                         //
//===============================================================================================//

const fetch = require('node-fetch');
const weatherKey = process.env.WEATHER_KEY;

//===============================================================================================//

// Function that returns the results from searching the database for the current weather and forecast.
// Finds weather based on passed in coordinates.
module.exports.getWeather = async (lat, long) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&appid=${weatherKey}&units=metric `);
    const jsonResponse = await response.json();

    return jsonResponse;
};