import React, { useEffect, useState } from 'react';
import { weatherApi } from '../utils/api';

export function MapEmbed({ lat, lon }) {
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    if (!lat || !lon) return;
    weatherApi.getMapsUrl(lat, lon).then(r => {
      if (r.url) setMapUrl(r.url);
    }).catch(() => {});
  }, [lat, lon]);

  if (!lat || !lon) return null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-5 py-3 flex items-center gap-2 border-b" style={{ borderColor: 'rgba(99,139,255,0.1)' }}>
        <span>🗺️</span>
        <h3 className="font-display font-bold text-base" style={{ color: '#c5d3f0' }}>Map View</h3>
      </div>
      {mapUrl ? (
        <iframe
          title="Location Map"
          src={mapUrl}
          width="100%"
          height="300"
          style={{ border: 'none', display: 'block' }}
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <div className="p-6 text-center" style={{ color: '#7a8ba8' }}>
          <div className="text-3xl mb-2">🗺️</div>
          <p className="text-sm">
            Add <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)' }}>GOOGLE_MAPS_API_KEY</code> to backend <code className="font-mono text-xs">.env</code> to enable map embed.
          </p>
          <p className="text-xs mt-2" style={{ color: '#4a5568' }}>
            Coordinates: {lat?.toFixed(4)}, {lon?.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
}

export function YouTubeVideos({ location }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    weatherApi.getYouTube(location).then(r => {
      setVideos(r.videos || []);
      if (r.message) setMessage(r.message);
    }).catch(() => {
      setMessage('YouTube unavailable');
    }).finally(() => setLoading(false));
  }, [location]);

  if (loading) return (
    <div className="glass-card rounded-2xl p-5 flex items-center gap-3">
      <div className="spinner w-4 h-4" />
      <span className="text-sm" style={{ color: '#7a8ba8' }}>Loading videos…</span>
    </div>
  );

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span>▶️</span>
        <h3 className="font-display font-bold text-base" style={{ color: '#c5d3f0' }}>Explore {location}</h3>
      </div>
      {message && !videos.length ? (
        <div className="text-sm text-center py-4" style={{ color: '#7a8ba8' }}>
          <p>{message}</p>
          <p className="text-xs mt-1">Add <code className="font-mono text-xs">YOUTUBE_API_KEY</code> to backend .env to enable.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {videos.map(v => (
            <a
              key={v.id}
              href={`https://www.youtube.com/watch?v=${v.id}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl overflow-hidden block transition-all duration-200 hover:scale-105"
              style={{ border: '1px solid rgba(99,139,255,0.1)', textDecoration: 'none' }}
            >
              <img src={v.thumbnail} alt={v.title} className="w-full aspect-video object-cover" />
              <div className="p-2">
                <p className="text-xs font-medium line-clamp-2" style={{ color: '#c5d3f0' }}>{v.title}</p>
                <p className="text-xs mt-0.5" style={{ color: '#7aa895ff' }}>{v.channel}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
