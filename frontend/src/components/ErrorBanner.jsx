import React from 'react';

export default function ErrorBanner({ error, onDismiss }) {
  if (!error) return null;

  // Friendly error messages
  const friendlyMessages = {
    'Location': '📍 Location not found. Try a different city name, zip code, or coordinates.',
    'OPENWEATHER_API_KEY': '🔑 OpenWeatherMap API key not configured. Add it to backend/.env',
    'Network Error': '🌐 Network error. Make sure the backend server is running on port 5000.',
    'API request failed': '⚡ API request failed. Please try again in a moment.',
  };

  let message = error;
  for (const [key, val] of Object.entries(friendlyMessages)) {
    if (error.includes(key)) { message = val; break; }
  }

  return (
    <div
      className="fade-in flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
    >
      <span className="text-lg shrink-0">⚠️</span>
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} style={{ color: '#f87171', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>
          ✕
        </button>
      )}
    </div>
  );
}
