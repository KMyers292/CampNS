// https://api.openweathermap.org/data/2.5/weather?lat=57&lon=-2.15&appid=16c203e26989ae5d54fca4648562ae4c&units=metric 
const fetch = require('node-fetch');
const weatherKey = process.env.WEATHER_KEY;

module.exports.getWeather = async (lat, long) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&appid=${weatherKey}&units=metric `);
    const jsonResponse = await response.json();

    return jsonResponse;
};