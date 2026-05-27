const axios = require('axios');

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

function getApiKey() {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) throw new Error('OPENWEATHER_API_KEY not set in environment');
  return key;
}

// Resolve a location string to lat/lon via geocoding
async function geocodeLocation(locationInput) {
  const key = getApiKey();
  // Try direct geocoding first
  try {
    const res = await axios.get(`${GEO_URL}/direct`, {
      params: { q: locationInput, limit: 1, appid: key }
    });
    if (res.data && res.data.length > 0) {
      const loc = res.data[0];
      return {
        lat: loc.lat,
        lon: loc.lon,
        name: loc.name,
        country: loc.country,
        state: loc.state || null,
        displayName: [loc.name, loc.state, loc.country].filter(Boolean).join(', ')
      };
    }
  } catch (e) {
    // fall through to zip code attempt
  }

  // Try zip code
  try {
    const res = await axios.get(`${GEO_URL}/zip`, {
      params: { zip: locationInput, appid: key }
    });
    if (res.data && res.data.lat) {
      return {
        lat: res.data.lat,
        lon: res.data.lon,
        name: res.data.name,
        country: res.data.country,
        state: null,
        displayName: `${res.data.name}, ${res.data.country}`
      };
    }
  } catch (e) {
    // ignore
  }

  throw new Error(`Location "${locationInput}" could not be found. Please try a different search term.`);
}

// Get current weather
async function getCurrentWeather(lat, lon) {
  const key = getApiKey();
  const res = await axios.get(`${BASE_URL}/weather`, {
    params: { lat, lon, appid: key, units: 'metric' }
  });
  return res.data;
}

// Get 5-day forecast (3h intervals)
async function getForecast(lat, lon) {
  const key = getApiKey();
  const res = await axios.get(`${BASE_URL}/forecast`, {
    params: { lat, lon, appid: key, units: 'metric' }
  });
  return res.data;
}

// Get historical weather via One Call API (requires subscription) 
// Fallback: use forecast for future dates, current for today
async function getWeatherForDateRange(lat, lon, dateFrom, dateTo) {
  const key = getApiKey();
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  const now = new Date();

  const results = [];

  // For each day in range, attempt to get data
  // OpenWeatherMap free tier doesn't support historical, so we get forecast for future dates
  try {
    const forecast = await getForecast(lat, lon);
    const dailyMap = {};

    // Group forecast by day
    for (const item of forecast.list) {
      const day = item.dt_txt.split(' ')[0];
      if (!dailyMap[day]) dailyMap[day] = [];
      dailyMap[day].push(item);
    }

    // Walk dates
    let cur = new Date(from);
    while (cur <= to) {
      const dateStr = cur.toISOString().split('T')[0];
      if (dailyMap[dateStr]) {
        const temps = dailyMap[dateStr].map(d => d.main.temp);
        const conditions = dailyMap[dateStr].map(d => d.weather[0].description);
        results.push({
          date: dateStr,
          temp_min: Math.min(...temps).toFixed(1),
          temp_max: Math.max(...temps).toFixed(1),
          temp_avg: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
          condition: conditions[Math.floor(conditions.length / 2)],
          icon: dailyMap[dateStr][Math.floor(dailyMap[dateStr].length / 2)].weather[0].icon
        });
      } else {
        // Date outside forecast window
        results.push({
          date: dateStr,
          temp_min: null,
          temp_max: null,
          temp_avg: null,
          condition: 'Data not available (outside 5-day forecast window)',
          icon: null
        });
      }
      cur.setDate(cur.getDate() + 1);
    }
  } catch (e) {
    throw new Error('Failed to retrieve weather data: ' + e.message);
  }

  return results;
}

// Parse 5-day forecast into daily summaries
function parseDailyForecast(forecastData) {
  const dailyMap = {};
  for (const item of forecastData.list) {
    const day = item.dt_txt.split(' ')[0];
    if (!dailyMap[day]) {
      dailyMap[day] = { temps: [], icons: [], descriptions: [], items: [] };
    }
    dailyMap[day].temps.push(item.main.temp);
    dailyMap[day].icons.push(item.weather[0].icon);
    dailyMap[day].descriptions.push(item.weather[0].description);
    dailyMap[day].items.push(item);
  }

  return Object.entries(dailyMap).slice(0, 5).map(([date, data]) => ({
    date,
    temp_min: Math.min(...data.temps).toFixed(1),
    temp_max: Math.max(...data.temps).toFixed(1),
    temp_avg: (data.temps.reduce((a, b) => a + b, 0) / data.temps.length).toFixed(1),
    icon: data.icons[Math.floor(data.icons.length / 2)],
    description: data.descriptions[Math.floor(data.descriptions.length / 2)],
    humidity: data.items[Math.floor(data.items.length / 2)].main.humidity,
    wind_speed: data.items[Math.floor(data.items.length / 2)].wind.speed
  }));
}

module.exports = { geocodeLocation, getCurrentWeather, getForecast, getWeatherForDateRange, parseDailyForecast };
