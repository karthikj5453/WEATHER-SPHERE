import React, { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import FiveDayForecast from './components/FiveDayForecast';
import QueryHistory from './components/QueryHistory';
import SaveQueryForm from './components/SaveQueryForm';
import { MapEmbed, YouTubeVideos } from './components/MediaPanels';
import ErrorBanner from './components/ErrorBanner';
import { weatherApi } from './utils/api';

const TABS = ['🌤 Weather', '🗂 History', '🗺 Explore'];

export default function App() {
  const [tab, setTab] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationInput, setLocationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historySeed, setHistorySeed] = useState(0);

  const fetchWeather = useCallback(async (loc) => {
    setLoading(true);
    setError('');
    setWeatherData(null);
    try {
      const data = await weatherApi.getCurrentByLocation(loc);
      setWeatherData(data);
      setLocation(data.location);
      setLocationInput(loc);
      setTab(0);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await weatherApi.getCurrentByCoords(pos.coords.latitude, pos.coords.longitude);
          setWeatherData(data);
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude, displayName: data.current?.name || 'Your Location' });
          setLocationInput(data.current?.name || 'Current Location');
          setTab(0);
        } catch (e) {
          setError(e.response?.data?.error || e.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        setError('Could not get your location: ' + err.message);
      }
    );
  };

  const handleHistorySelect = (q) => {
    if (q.weather_data) {
      setWeatherData({ current: q.weather_data.current, forecast: q.weather_data.forecast });
      setLocation({ lat: q.latitude, lon: q.longitude, displayName: q.resolved_location || q.location_input });
      setLocationInput(q.location_input);
      setTab(0);
    }
  };

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen relative">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-mono"
            style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)', color: '#7eb3ff' }}>
            ⚡ PM Accelerator — Technical Assessment
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl mb-2 gradient-text">
            WeatherSphere
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: '#7a8ba8' }}>
            Real-time weather intelligence — search any location worldwide, save queries, and explore destinations.
          </p>
        </header>

        {/* Search */}
        <div className="mb-6">
          <SearchBar onSearch={fetchWeather} onGeolocate={handleGeolocate} loading={loading} />
        </div>

        {/* Error */}
        <div className="mb-4 max-w-2xl mx-auto">
          <ErrorBanner error={error} onDismiss={() => setError('')} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-12">
            <div className="spinner w-8 h-8" />
            <span style={{ color: '#7a8ba8' }}>Fetching weather data…</span>
          </div>
        )}

        {/* Tabs */}
        {!loading && (
          <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'rgba(99,139,255,0.12)' }}>
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={`px-4 py-2.5 text-sm font-semibold font-display rounded-t-xl transition-all border-b-2 ${i === tab ? 'tab-active' : ''}`}
                style={{
                  borderBottomColor: i === tab ? '#4f8ef7' : 'transparent',
                  color: i === tab ? '#7eb3ff' : '#7a8ba8',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        {!loading && tab === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-5">
              {!weatherData && !error && (
                <div className="glass-card rounded-2xl p-10 text-center">
                  <div className="text-6xl mb-4">🌍</div>
                  <h2 className="font-display font-bold text-xl mb-2" style={{ color: '#c5d3f0' }}>
                    Search for any location
                  </h2>
                  <p className="text-sm" style={{ color: '#7a8ba8' }}>
                    Enter a city name, ZIP code, landmark, GPS coordinates, or use your current location.
                  </p>
                  <div className="grid grid-cols-3 gap-3 mt-6 text-sm" style={{ color: '#4a5568' }}>
                    {['New York, US', '10001', '48.8566, 2.3522', 'Eiffel Tower', 'Tokyo, JP', 'EC1A 1BB'].map(eg => (
                      <button
                        key={eg}
                        onClick={() => fetchWeather(eg)}
                        className="px-3 py-2 rounded-xl text-xs font-mono transition-all hover:opacity-80"
                        style={{ background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.12)', color: '#7eb3ff', cursor: 'pointer' }}
                      >
                        {eg}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {weatherData && (
                <>
                  <CurrentWeather data={weatherData} location={location} />
                  <FiveDayForecast forecast={weatherData.forecast} />
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <SaveQueryForm
                currentLocation={locationInput}
                onSaved={() => setHistorySeed(s => s + 1)}
              />
              {/* About PM Accelerator */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-base mb-3" style={{ color: '#c5d3f0' }}>
                  🚀 PM Accelerator
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: '#7a8ba8' }}>
                  PM Accelerator is the world's #1 product management career accelerator. We empower aspiring and current PMs with hands-on training, mentorship, and real-world projects to land top PM roles at leading tech companies.
                </p>
                <a
                  href="https://www.linkedin.com/company/product-manager-accelerator/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-xs font-semibold"
                  style={{ color: '#4f8ef7', textDecoration: 'none' }}
                >
                  View on LinkedIn →
                </a>
              </div>
            </div>
          </div>
        )}

        {!loading && tab === 1 && (
          <QueryHistory onSelectQuery={handleHistorySelect} refreshTrigger={historySeed} />
        )}

        {!loading && tab === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <MapEmbed lat={location?.lat} lon={location?.lon} />
            <YouTubeVideos location={locationInput || location?.displayName} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-xs" style={{ color: '#4a5568' }}>
          <p>Built by <span style={{ color: '#7eb3ff' }}>Karthik</span> · PM Accelerator Full Stack Assessment · {year}</p>
          <p className="mt-1">Powered by OpenWeatherMap API</p>
        </footer>
      </div>
    </div>
  );
}
