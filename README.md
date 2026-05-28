# WeatherSphere

WeatherSphere is a full-stack weather dashboard and destination explorer built with a **React (Vite)** frontend and an **Express / Node.js** backend. It integrates the OpenWeatherMap API for live weather reports, standard geolocation searches, and coordinate-based reverse lookup, alongside interactive Google Maps embeds and YouTube travel logs.

This repository satisfies all requirements for both the **Frontend (Assessment #1)** and **Backend (Assessment #2)** sections of the PM Accelerator Technical Assessment.

---

## Key Features

### Frontend
* **Flexible Location Search:** Resolves queries by city name, ZIP code, landmark, or raw GPS coordinates.
* **One-Click Geolocation:** Uses the HTML5 Geolocation API to fetch live weather for the user's current location.
* **Detailed Current Conditions:** Shows temperature, feels-like temperature, humidity, wind direction/speed, visibility, atmospheric pressure, cloud cover, and sunrise/sunset times.
* **5-Day Forecast:** Displays a responsive card layout detailing expected high/low temperatures, descriptions, and humidity.
* **Responsive Layout:** A responsive glassmorphic UI using Tailwind CSS designed to scale cleanly across mobile, tablet, and desktop screens.
* **User-Friendly Error Handling:** Intercepts invalid location entries or connection timeouts and prints helpful recovery suggestions.

### Backend & Database
* **CRUD History Log:** A JSON file-based database store (simulating SQLite operations) that persists past searches with custom date ranges.
* **Data Validations:** 
  * Rejects query requests where the start date is after the end date.
  * Restricts date range queries to a maximum of 60 days to prevent server overload.
  * Verifies locations exist through geocoding API lookups before writing to the database.
* **Destination Explorer (Optional API Integrations):**
  * Spawns an interactive Google Maps embed centered at the exact location.
  * Fetches regional travel guides and weather-related videos via the YouTube Data API v3.
* **Multi-Format Export Service:** Supports single-click query history downloads in **JSON, CSV, XML, Markdown, or PDF** formats.

### Custom Enhancements
* **Coordinates Reverse Lookup:** A custom parser at the top of the geocoding service detects coordinate inputs (e.g. `48.8566, 2.3522`), reverse-lookup coordinates using the OpenWeatherMap API, and returns the formal city name (e.g., "Paris, France").
* **Silent Validation Fallbacks:** If the requested date range extends past the active 5-day forecast limit of the free API, the service clips the results and prints explicit placeholder warnings to ensure the application does not crash.

---

## Tech Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Axios
* **Backend:** Node.js, Express, Axios, CORS, dotenv
* **Database:** In-memory / file-based JSON store (SQLite interface simulation)
* **Libraries used for Export:** `json2csv` (CSV), `xml2js` (XML), `pdfkit` (PDF)

---

## Quick Start

### Prerequisites
* Node.js 18+
* An [OpenWeatherMap API Key](https://openweathermap.org/api) (Free Tier)

### 1. Configure and Run the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your credentials:
   ```env
   OPENWEATHER_API_KEY=your_openweathermap_api_key_here
   YOUTUBE_API_KEY=your_youtube_key_here  # Optional
   GOOGLE_MAPS_API_KEY=your_maps_key_here  # Optional
   PORT=5000
   ```
4. Install dependencies and start the server:
   ```bash
   npm install
   ```
   *To run in production mode:*
   ```bash
   npm start
   ```
   *To run in development mode with automatic restarts:*
   ```bash
   npm run dev
   ```

The backend server runs at `http://localhost:5000`.

### 2. Configure and Run the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies and start the Vite dev server:
   ```bash
   npm install
   npm run dev
   ```

The frontend app runs at `http://localhost:3000`.

---

## API Endpoints

### Weather
* `GET /api/weather/current?location=<query>` — Fetches current weather and 5-day forecast.
* `GET /api/weather/by-coords?lat=<lat>&lon=<lon>` — Fetches weather data by coordinates.

### CRUD History
* `POST /api/queries` — Saves a new search query (expects `location_input`, `date_from`, `date_to`).
* `GET /api/queries` — Returns all saved query logs.
* `GET /api/queries/:id` — Returns details of a specific query log.
* `PUT /api/queries/:id` — Updates a saved search log.
* `DELETE /api/queries/:id` — Deletes a specific search log.

### Export & Integrations
* `GET /api/export/:format` — Exports data logs. Supported formats: `json`, `csv`, `xml`, `markdown`, `pdf`.
* `GET /api/youtube?location=<query>` — Resolves travel guide videos.
* `GET /api/maps/embed-url?lat=<lat>&lon=<lon>` — Generates embedded Google Maps URLs.

---

## About PM Accelerator

The Product Manager Accelerator is the world’s #1 career accelerator for product managers. It empowers aspiring and active PMs with structured curriculum, real-world case studies, executive mentorship, and collaborative cohort projects to secure high-growth PM positions at premier technology firms globally.

Learn more at their [LinkedIn Page](https://www.linkedin.com/company/product-manager-accelerator/).

---

**Author:** Karthik  
**Role:** AI Engineer Intern Candidate
