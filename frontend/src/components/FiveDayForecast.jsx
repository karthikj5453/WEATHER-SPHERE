import React from 'react';
import { getOWMIconUrl, formatDate, capitalize } from '../utils/weather';

export default function FiveDayForecast({ forecast }) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="fade-in glass-card rounded-2xl p-5 md:p-6">
      <h3 className="font-display font-bold text-lg mb-4" style={{ color: '#c5d3f0' }}>
        📅 5-Day Forecast
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {forecast.slice(0, 5).map((day, i) => (
          <div
            key={day.date}
            className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 slide-up"
            style={{
              background: i === 0 ? 'rgba(79,142,247,0.1)' : 'rgba(255,255,255,0.03)',
              border: i === 0 ? '1px solid rgba(79,142,247,0.25)' : '1px solid rgba(99,139,255,0.08)',
              animationDelay: `${i * 0.07}s`
            }}
          >
            <div className="text-xs font-semibold" style={{ color: i === 0 ? '#7eb3ff' : '#7a8ba8' }}>
              {i === 0 ? 'Today' : formatDate(day.date)}
            </div>
            {day.icon ? (
              <img src={getOWMIconUrl(day.icon)} alt={day.description} className="w-10 h-10" />
            ) : (
              <span className="text-2xl">🌡️</span>
            )}
            <div className="text-center">
              <div className="font-display font-bold text-lg" style={{ color: '#e8edf8' }}>
                {Math.round(day.temp_max)}°
              </div>
              <div className="text-xs" style={{ color: '#7a8ba8' }}>
                {Math.round(day.temp_min)}°
              </div>
            </div>
            <div className="text-xs text-center font-medium" style={{ color: '#7a8ba8' }}>
              {capitalize(day.description)}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs">💧</span>
              <span className="text-xs font-mono" style={{ color: '#7a8ba8' }}>{day.humidity}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
