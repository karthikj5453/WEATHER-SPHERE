// Map OWM icon codes to emoji + label
export const weatherMeta = (iconCode) => {
  const code = iconCode?.replace('n', 'd') || '';
  const map = {
    '01d': { emoji: '☀️', label: 'Clear Sky', bg: 'weather-clear' },
    '02d': { emoji: '⛅', label: 'Few Clouds', bg: 'weather-clear' },
    '03d': { emoji: '🌥️', label: 'Scattered Clouds', bg: 'weather-clouds' },
    '04d': { emoji: '☁️', label: 'Broken Clouds', bg: 'weather-clouds' },
    '09d': { emoji: '🌧️', label: 'Shower Rain', bg: 'weather-rain' },
    '10d': { emoji: '🌦️', label: 'Rain', bg: 'weather-rain' },
    '11d': { emoji: '⛈️', label: 'Thunderstorm', bg: 'weather-thunder' },
    '13d': { emoji: '❄️', label: 'Snow', bg: 'weather-snow' },
    '50d': { emoji: '🌫️', label: 'Mist', bg: 'weather-clouds' },
  };
  return map[code] || { emoji: '🌡️', label: 'Unknown', bg: 'weather-clear' };
};

export const getOWMIconUrl = (icon) =>
  `https://openweathermap.org/img/wn/${icon}@2x.png`;

export const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export const windDirection = (degrees) => {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(degrees / 45) % 8];
};

export const uvIndex = (uv) => {
  if (uv === undefined || uv === null) return { label: 'N/A', color: '#888' };
  if (uv < 3) return { label: 'Low', color: '#4ade80' };
  if (uv < 6) return { label: 'Moderate', color: '#facc15' };
  if (uv < 8) return { label: 'High', color: '#f97316' };
  if (uv < 11) return { label: 'Very High', color: '#ef4444' };
  return { label: 'Extreme', color: '#a855f7' };
};

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
