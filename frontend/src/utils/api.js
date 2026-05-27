import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const weatherApi = {
  getCurrentByLocation: (location) =>
    api.get('/weather/current', { params: { location } }).then(r => r.data),

  getCurrentByCoords: (lat, lon) =>
    api.get('/weather/by-coords', { params: { lat, lon } }).then(r => r.data),

  // CRUD
  createQuery: (data) => api.post('/queries', data).then(r => r.data),
  getQueries: () => api.get('/queries').then(r => r.data),
  getQuery: (id) => api.get(`/queries/${id}`).then(r => r.data),
  updateQuery: (id, data) => api.put(`/queries/${id}`, data).then(r => r.data),
  deleteQuery: (id) => api.delete(`/queries/${id}`).then(r => r.data),

  // Extra APIs
  getYouTube: (location) => api.get('/youtube', { params: { location } }).then(r => r.data),
  getMapsUrl: (lat, lon) => api.get('/maps/embed-url', { params: { lat, lon } }).then(r => r.data),

  // Export
  exportUrl: (format) => `/api/export/${format}`
};

export default api;
