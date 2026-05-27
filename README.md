# 🌤 WeatherSphere — Full Stack Weather App

**PM Accelerator Technical Assessment — Full Stack Engineer**  
Built by [Your Name]

---

## Overview

WeatherSphere is a full-stack weather application combining a **React + Vite** frontend with a **Node.js + Express + SQLite** backend. It delivers real-time weather data, a 5-day forecast, full CRUD query history, and multi-format data export.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express, SQLite (better-sqlite3) |
| Weather API | OpenWeatherMap (free tier) |
| Optional APIs | YouTube Data API v3, Google Maps Embed |

---

## Features

### Assessment #1 — Frontend
- 🔍 Search by city, zip code, GPS coordinates, or landmarks
- 📍 Geolocation support (browser-based)
- 🌡️ Current weather with detailed stats (temperature, humidity, wind, visibility, pressure, UV)
- 📅 5-day forecast with daily min/max, conditions, humidity
- 🎨 Responsive design (mobile, tablet, desktop)
- ⚠️ Graceful error handling with user-friendly messages

### Assessment #2 — Backend
- 🗄️ Full CRUD operations on weather query history (SQLite)
- ✅ Input validation: location existence (geocoding), date range validation (max 60 days, chronological order)
- 📤 Data export: **JSON, CSV, XML, Markdown, PDF**
- 🎬 YouTube API integration (travel/location videos)
- 🗺️ Google Maps Embed API integration
- 🌐 RESTful API design

---

## Setup & Running

### Prerequisites
- Node.js 18+
- An [OpenWeatherMap API key](https://openweathermap.org/api) (free)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your OPENWEATHER_API_KEY
npm install
npm start
# Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

Then open **http://localhost:3000** in your browser.

---

## Environment Variables (backend/.env)

```env
# Required
OPENWEATHER_API_KEY=your_key_here

# Optional
YOUTUBE_API_KEY=your_youtube_key_here
GOOGLE_MAPS_API_KEY=your_maps_key_here

PORT=5000
```

Get free API keys:
- **OpenWeatherMap**: https://openweathermap.org/api
- **YouTube Data API v3**: https://console.cloud.google.com
- **Google Maps Embed**: https://console.cloud.google.com

---

## API Endpoints

### Weather
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather/current?location=Paris` | Current weather + 5-day forecast |
| GET | `/api/weather/by-coords?lat=48.8&lon=2.3` | Weather by GPS coordinates |

### CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/queries` | Create: save a weather query with optional date range |
| GET | `/api/queries` | Read: list all saved queries |
| GET | `/api/queries/:id` | Read: get single query by ID |
| PUT | `/api/queries/:id` | Update: modify location or date range |
| DELETE | `/api/queries/:id` | Delete: remove a query |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export/json` | Export as JSON |
| GET | `/api/export/csv` | Export as CSV |
| GET | `/api/export/xml` | Export as XML |
| GET | `/api/export/markdown` | Export as Markdown |
| GET | `/api/export/pdf` | Export as PDF |

### Additional APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/youtube?location=Tokyo` | YouTube videos for location |
| GET | `/api/maps/embed-url?lat=35.6&lon=139.7` | Google Maps embed URL |

---

## Validation Rules

- **Location**: Must resolve via OpenWeatherMap Geocoding API (supports city names, ZIP codes, coordinates)
- **Date range**: Both dates must be valid, `date_from` ≤ `date_to`, max 60-day span
- **Fuzzy matching**: OpenWeatherMap's geocoder handles partial names and misspellings

---

## Project Structure

```
weather-app/
├── backend/
│   ├── src/
│   │   ├── server.js         # Express app + all routes
│   │   ├── database.js       # SQLite setup
│   │   ├── weatherService.js # OpenWeatherMap API calls
│   │   └── exportService.js  # JSON/CSV/XML/MD/PDF export
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx            # Main app with tabs
    │   ├── components/
    │   │   ├── SearchBar.jsx
    │   │   ├── CurrentWeather.jsx
    │   │   ├── FiveDayForecast.jsx
    │   │   ├── QueryHistory.jsx   # CRUD UI
    │   │   ├── SaveQueryForm.jsx
    │   │   ├── MediaPanels.jsx    # Map + YouTube
    │   │   └── ErrorBanner.jsx
    │   └── utils/
    │       ├── api.js         # Axios API client
    │       └── weather.js     # Weather helpers
    └── package.json
```

---

## About PM Accelerator

PM Accelerator is the world's #1 product management career accelerator, empowering aspiring and current product managers with hands-on training, mentorship, and real-world projects to help them land top PM roles at leading tech companies.

[LinkedIn →](https://www.linkedin.com/company/product-manager-accelerator/)
