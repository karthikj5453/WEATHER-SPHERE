import React, { useState, useEffect } from 'react';
import { weatherApi } from '../utils/api';
import { formatDateTime } from '../utils/weather';

export default function QueryHistory({ onSelectQuery, refreshTrigger }) {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await weatherApi.getQueries();
      setQueries(data);
    } catch (e) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this query?')) return;
    try {
      await weatherApi.deleteQuery(id);
      setQueries(q => q.filter(r => r.id !== id));
    } catch (e) {
      alert('Delete failed: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleEditSave = async (id) => {
    try {
      const updated = await weatherApi.updateQuery(id, editData);
      setQueries(q => q.map(r => r.id === id ? updated : r));
      setEditId(null);
    } catch (e) {
      alert('Update failed: ' + (e.response?.data?.error || e.message));
    }
  };

  const formats = ['json', 'csv', 'xml', 'markdown', 'pdf'];

  if (loading) return (
    <div className="glass-card rounded-2xl p-8 flex items-center justify-center gap-3">
      <div className="spinner w-5 h-5" />
      <span style={{ color: '#7a8ba8' }}>Loading history…</span>
    </div>
  );

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-lg" style={{ color: '#c5d3f0' }}>
          🗂 Query History
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs" style={{ color: '#7a8ba8' }}>Export:</span>
          {formats.map(fmt => (
            <a
              key={fmt}
              href={weatherApi.exportUrl(fmt)}
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 rounded-lg text-xs font-mono font-medium transition-colors"
              style={{
                background: 'rgba(79,142,247,0.1)',
                border: '1px solid rgba(79,142,247,0.2)',
                color: '#7eb3ff',
                textDecoration: 'none'
              }}
            >
              {fmt.toUpperCase()}
            </a>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-sm mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {queries.length === 0 ? (
        <div className="text-center py-8" style={{ color: '#7a8ba8' }}>
          <div className="text-3xl mb-2">📭</div>
          <p className="text-sm">No saved queries yet. Search for a location and save it.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {queries.map(q => (
            <div
              key={q.id}
              className="rounded-xl p-4 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,139,255,0.08)' }}
            >
              {editId === q.id ? (
                // Edit mode
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.location_input || ''}
                    onChange={e => setEditData(d => ({ ...d, location_input: e.target.value }))}
                    placeholder="Location"
                    className="w-full px-3 py-2 rounded-lg text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={editData.date_from || ''}
                      onChange={e => setEditData(d => ({ ...d, date_from: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg text-sm"
                    />
                    <input
                      type="date"
                      value={editData.date_to || ''}
                      onChange={e => setEditData(d => ({ ...d, date_to: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSave(q.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(79,142,247,0.2)', color: '#7eb3ff', border: '1px solid rgba(79,142,247,0.3)' }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#7a8ba8', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onSelectQuery(q)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm" style={{ color: '#c5d3f0' }}>
                        {q.resolved_location || q.location_input}
                      </span>
                      {q.weather_data?.current?.weather?.[0]?.icon && (
                        <img
                          src={`https://openweathermap.org/img/wn/${q.weather_data.current.weather[0].icon}.png`}
                          alt=""
                          className="w-6 h-6"
                        />
                      )}
                      {q.weather_data?.current?.main?.temp && (
                        <span className="text-xs font-mono" style={{ color: '#7eb3ff' }}>
                          {Math.round(q.weather_data.current.main.temp)}°C
                        </span>
                      )}
                    </div>
                    {(q.date_from || q.date_to) && (
                      <div className="text-xs mb-1" style={{ color: '#7a8ba8' }}>
                        📅 {q.date_from} → {q.date_to}
                      </div>
                    )}
                    <div className="text-xs" style={{ color: '#4a5568' }}>
                      Saved {formatDateTime(q.created_at)}
                      {q.updated_at !== q.created_at && ` · Updated ${formatDateTime(q.updated_at)}`}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => { setEditId(q.id); setEditData({ location_input: q.location_input, date_from: q.date_from || '', date_to: q.date_to || '' }); }}
                      className="p-1.5 rounded-lg text-sm transition-colors"
                      title="Edit"
                      style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.15)' }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded-lg text-sm transition-colors"
                      title="Delete"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
