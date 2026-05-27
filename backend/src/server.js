require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./database');
const { geocodeLocation, getCurrentWeather, getForecast, getWeatherForDateRange, parseDailyForecast } = require('./weatherService');
const { exportJSON, exportCSV, exportXML, exportMarkdown, exportPDF } = require('./exportService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ─── Current Weather + Forecast ──────────────────────────────────────────────
app.get('/api/weather/current', async (req, res) => {
  const { location } = req.query;
  if (!location) return res.status(400).json({ error: 'location parameter is required' });
  try {
    const geo = await geocodeLocation(location);
    const [current, forecastRaw] = await Promise.all([
      getCurrentWeather(geo.lat, geo.lon),
      getForecast(geo.lat, geo.lon)
    ]);
    const forecast = parseDailyForecast(forecastRaw);
    res.json({ location: geo, current, forecast });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.get('/api/weather/by-coords', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });
  try {
    const [current, forecastRaw] = await Promise.all([
      getCurrentWeather(parseFloat(lat), parseFloat(lon)),
      getForecast(parseFloat(lat), parseFloat(lon))
    ]);
    res.json({ current, forecast: parseDailyForecast(forecastRaw) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CRUD: CREATE ─────────────────────────────────────────────────────────────
app.post('/api/queries', async (req, res) => {
  const { location_input, date_from, date_to } = req.body;
  if (!location_input) return res.status(400).json({ error: 'location_input is required' });

  if (date_from && date_to) {
    const from = new Date(date_from), to = new Date(date_to);
    if (isNaN(from.getTime())) return res.status(400).json({ error: 'Invalid date_from format. Use YYYY-MM-DD.' });
    if (isNaN(to.getTime()))   return res.status(400).json({ error: 'Invalid date_to format. Use YYYY-MM-DD.' });
    if (from > to)             return res.status(400).json({ error: 'date_from must be before or equal to date_to.' });
    if ((to - from) / 86400000 > 60) return res.status(400).json({ error: 'Date range cannot exceed 60 days.' });
  }

  try {
    const geo = await geocodeLocation(location_input);
    const [current, forecastRaw] = await Promise.all([
      getCurrentWeather(geo.lat, geo.lon),
      getForecast(geo.lat, geo.lon)
    ]);
    const forecast = parseDailyForecast(forecastRaw);
    let dateRange = null;
    if (date_from && date_to) dateRange = await getWeatherForDateRange(geo.lat, geo.lon, date_from, date_to);

    const record = db.insertQuery({
      location_input,
      resolved_location: geo.displayName,
      latitude: geo.lat,
      longitude: geo.lon,
      date_from: date_from || null,
      date_to: date_to || null,
      weather_data: JSON.stringify({ current, forecast, dateRange })
    });

    res.status(201).json({ ...record, weather_data: JSON.parse(record.weather_data), location: geo });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── CRUD: READ ───────────────────────────────────────────────────────────────
app.get('/api/queries', (req, res) => {
  const records = db.getAllQueries();
  res.json(records.map(r => ({ ...r, weather_data: r.weather_data ? JSON.parse(r.weather_data) : null })));
});

app.get('/api/queries/:id', (req, res) => {
  const record = db.getQuery(req.params.id);
  if (!record) return res.status(404).json({ error: 'Query not found' });
  res.json({ ...record, weather_data: JSON.parse(record.weather_data) });
});

// ─── CRUD: UPDATE ─────────────────────────────────────────────────────────────
app.put('/api/queries/:id', async (req, res) => {
  const { id } = req.params;
  const existing = db.getQuery(id);
  if (!existing) return res.status(404).json({ error: 'Query not found' });

  const { location_input, date_from, date_to } = req.body;
  const newLoc = location_input || existing.location_input;
  const newFrom = date_from !== undefined ? date_from : existing.date_from;
  const newTo   = date_to   !== undefined ? date_to   : existing.date_to;

  if (newFrom && newTo) {
    const from = new Date(newFrom), to = new Date(newTo);
    if (isNaN(from.getTime())) return res.status(400).json({ error: 'Invalid date_from' });
    if (isNaN(to.getTime()))   return res.status(400).json({ error: 'Invalid date_to' });
    if (from > to)             return res.status(400).json({ error: 'date_from must be before date_to' });
  }

  try {
    const geo = await geocodeLocation(newLoc);
    const [current, forecastRaw] = await Promise.all([
      getCurrentWeather(geo.lat, geo.lon),
      getForecast(geo.lat, geo.lon)
    ]);
    let dateRange = null;
    if (newFrom && newTo) dateRange = await getWeatherForDateRange(geo.lat, geo.lon, newFrom, newTo);

    const updated = db.updateQuery(id, {
      location_input: newLoc,
      resolved_location: geo.displayName,
      latitude: geo.lat,
      longitude: geo.lon,
      date_from: newFrom || null,
      date_to:   newTo   || null,
      weather_data: JSON.stringify({ current, forecast: parseDailyForecast(forecastRaw), dateRange })
    });

    res.json({ ...updated, weather_data: JSON.parse(updated.weather_data) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── CRUD: DELETE ─────────────────────────────────────────────────────────────
app.delete('/api/queries/:id', (req, res) => {
  const ok = db.deleteQuery(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Query not found' });
  res.json({ message: `Query #${req.params.id} deleted successfully` });
});

// ─── EXPORT ───────────────────────────────────────────────────────────────────
app.get('/api/export/:format', (req, res) => {
  const records = db.getAllQueries();
  switch (req.params.format) {
    case 'json':
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="weather_queries.json"');
      return res.send(exportJSON(records));
    case 'csv':
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="weather_queries.csv"');
      return res.send(exportCSV(records));
    case 'xml':
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', 'attachment; filename="weather_queries.xml"');
      return res.send(exportXML(records));
    case 'markdown':
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="weather_queries.md"');
      return res.send(exportMarkdown(records));
    case 'pdf':
      return exportPDF(records, res);
    default:
      return res.status(400).json({ error: 'Unsupported format. Use: json, csv, xml, markdown, pdf' });
  }
});

// ─── YOUTUBE ──────────────────────────────────────────────────────────────────
app.get('/api/youtube', async (req, res) => {
  const { location } = req.query;
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return res.json({ videos: [], message: 'YouTube API key not configured' });
  if (!location) return res.status(400).json({ error: 'location is required' });
  try {
    const axios = require('axios');
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: { part: 'snippet', q: `${location} travel weather`, type: 'video', maxResults: 4, key }
    });
    const videos = response.data.items.map(v => ({
      id: v.id.videoId,
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails.medium.url,
      channel: v.snippet.channelTitle,
    }));
    res.json({ videos });
  } catch (err) {
    res.status(500).json({ error: 'YouTube API error: ' + err.message });
  }
});

// ─── MAPS ─────────────────────────────────────────────────────────────────────
app.get('/api/maps/embed-url', (req, res) => {
  const { lat, lon } = req.query;
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return res.json({ url: null, message: 'Google Maps API key not configured' });
  const url = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${lat},${lon}&zoom=12`;
  res.json({ url });
});

app.listen(PORT, () => console.log(`🌤  Weather App running on http://localhost:${PORT}`));
