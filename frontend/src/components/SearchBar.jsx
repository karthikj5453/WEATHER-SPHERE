import React, { useState } from 'react';

export default function SearchBar({ onSearch, onGeolocate, loading }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    onSearch(val);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">🔍</span>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter city, zip code, landmark, or coordinates…"
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-body"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #4f8ef7, #3b72d4)',
            color: '#fff',
            opacity: loading || !input.trim() ? 0.6 : 1,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? <span className="spinner inline-block w-4 h-4" /> : 'Search'}
        </button>
        <button
          type="button"
          onClick={onGeolocate}
          disabled={loading}
          className="px-4 py-3 rounded-xl text-sm transition-all duration-200 glass-card tooltip"
          data-tip="Use my location"
          title="Use my current location"
          style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          📍
        </button>
      </form>
    </div>
  );
}
