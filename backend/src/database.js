const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'weather.db');

// We use a simple JSON file-based store as a fallback since better-sqlite3
// can't compile in this environment. This simulates SQLite CRUD behaviour.
let store = { queries: [], nextId: 1 };

function loadStore() {
  if (fs.existsSync(DB_PATH)) {
    try { store = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch(e) {}
  }
}

function saveStore() {
  fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2));
}

loadStore();

const db = {
  // CREATE
  insertQuery(data) {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const record = { id: store.nextId++, ...data, created_at: now, updated_at: now };
    store.queries.push(record);
    saveStore();
    return record;
  },

  // READ ALL
  getAllQueries() {
    return [...store.queries].reverse();
  },

  // READ ONE
  getQuery(id) {
    return store.queries.find(q => q.id === parseInt(id)) || null;
  },

  // UPDATE
  updateQuery(id, data) {
    const idx = store.queries.findIndex(q => q.id === parseInt(id));
    if (idx === -1) return null;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    store.queries[idx] = { ...store.queries[idx], ...data, updated_at: now };
    saveStore();
    return store.queries[idx];
  },

  // DELETE
  deleteQuery(id) {
    const idx = store.queries.findIndex(q => q.id === parseInt(id));
    if (idx === -1) return false;
    store.queries.splice(idx, 1);
    saveStore();
    return true;
  }
};

module.exports = { db };
