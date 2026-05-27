import React from 'react';
import { weatherMeta, getOWMIconUrl, windDirection, capitalize } from '../utils/weather';

export default function CurrentWeather({ data, location }) {
  if (!data || !data.current) return null;

  const w = data.current;
  const meta = weatherMeta(w.weather?.[0]?.icon);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const stats = [
    { icon: '💧', label: 'Humidity', value: `${w.main?.humidity}%` },
    { icon: '🌬️', label: 'Wind', value: `${w.wind?.speed?.toFixed(1)} m/s ${windDirection(w.wind?.deg)}` },
    { icon: '👁️', label: 'Visibility', value: w.visibility ? `${(w.visibility / 1000).toFixed(1)} km` : 'N/A' },
    { icon: '🌡️', label: 'Feels Like', value: `${Math.round(w.main?.feels_like)}°C` },
    { icon: '📊', label: 'Pressure', value: `${w.main?.pressure} hPa` },
    { icon: '☁️', label: 'Cloud Cover', value: `${w.clouds?.all}%` },
  ];

  const sunrise = new Date(w.sys?.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(w.sys?.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fade-in glass-card weather-glow rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📍</span>
            <h2 className="font-display font-bold text-2xl md:text-3xl" style={{ color: '#e8edf8' }}>
              {location?.displayName || w.name}
            </h2>
          </div>
          <p className="text-sm" style={{ color: '#7a8ba8' }}>{dateStr} · {timeStr} local</p>
        </div>
        <div className="flex items-center gap-3">
          <img
            src={getOWMIconUrl(w.weather?.[0]?.icon)}
            alt={w.weather?.[0]?.description}
            className="w-16 h-16 drop-shadow-lg"
          />
          <div className="text-right">
            <div className="font-display font-extrabold text-5xl md:text-6xl gradient-text">
              {Math.round(w.main?.temp)}°
            </div>
            <div className="text-sm font-medium" style={{ color: '#7a8ba8' }}>
              {capitalize(w.weather?.[0]?.description)}
            </div>
          </div>
        </div>
      </div>

      {/* Temp range bar */}
      <div className="flex items-center gap-3 mb-6 py-3 px-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,139,255,0.1)' }}>
        <span className="text-sm font-mono" style={{ color: '#7a8ba8' }}>
          ↓ {Math.round(w.main?.temp_min)}°C
        </span>
        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full" style={{
            background: 'linear-gradient(90deg, #06b6d4, #f97316)',
            width: `${Math.min(100, Math.max(10, ((w.main?.temp - w.main?.temp_min) / Math.max(1, w.main?.temp_max - w.main?.temp_min)) * 100))}%`
          }} />
        </div>
        <span className="text-sm font-mono" style={{ color: '#e8edf8' }}>
          ↑ {Math.round(w.main?.temp_max)}°C
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {stats.map(s => (
          <div key={s.label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,139,255,0.08)' }}>
            <span className="text-lg">{s.icon}</span>
            <div>
              <div className="text-xs" style={{ color: '#7a8ba8' }}>{s.label}</div>
              <div className="text-sm font-semibold font-mono" style={{ color: '#c5d3f0' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sunrise / Sunset */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
          <span>🌅</span>
          <div>
            <div className="text-xs" style={{ color: '#f97316' }}>Sunrise</div>
            <div className="text-sm font-mono font-semibold">{sunrise}</div>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.15)' }}>
          <span>🌇</span>
          <div>
            <div className="text-xs" style={{ color: '#4f8ef7' }}>Sunset</div>
            <div className="text-sm font-mono font-semibold">{sunset}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
