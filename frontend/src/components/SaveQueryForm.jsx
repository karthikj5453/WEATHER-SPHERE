import React, { useState } from 'react';
import { weatherApi } from '../utils/api';

export default function SaveQueryForm({ currentLocation, onSaved }) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    if (!currentLocation) return;
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await weatherApi.createQuery({
        location_input: currentLocation,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined
      });
      setSuccess('Query saved to history!');
      setDateFrom('');
      setDateTo('');
      if (onSaved) onSaved();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save query');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-display font-bold text-base mb-4" style={{ color: '#c5d3f0' }}>
        💾 Save Query to History
      </h3>
      <div className="space-y-3">
        <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.12)' }}>
          <span style={{ color: '#7a8ba8' }}>Location: </span>
          <span style={{ color: '#c5d3f0' }}>{currentLocation || '—'}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs mb-1" style={{ color: '#7a8ba8' }}>From (optional)</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#7a8ba8' }}>To (optional)</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
            ✅ {success}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!currentLocation || saving}
          className="w-full py-2.5 rounded-xl text-sm font-semibold font-display transition-all"
          style={{
            background: !currentLocation ? 'rgba(255,255,255,0.05)' : 'rgba(79,142,247,0.15)',
            border: !currentLocation ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(79,142,247,0.3)',
            color: !currentLocation ? '#4a5568' : '#7eb3ff',
            cursor: !currentLocation ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? '⏳ Saving…' : '💾 Save Query'}
        </button>
      </div>
    </div>
  );
}
