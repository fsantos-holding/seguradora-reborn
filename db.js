const fs = require('fs');
const path = require('path');

// In Vercel serverless, /tmp is writable. We use it as persistent-ish storage.
// For true persistence, swap this for a real DB (e.g., Vercel KV, Supabase, etc.)
const DB_PATH = path.join('/tmp', 'backlog_reborn_db.json');
const SEED_PATH = path.join(__dirname, '..', 'data', 'db.json');

function getDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch (e) {}
  // First run: seed from data/db.json
  const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
  fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), 'utf-8');
  return seed;
}

function saveDB(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json(getDB());
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || !body.cards || !body.config) {
        return res.status(400).json({ error: 'Invalid DB structure' });
      }
      saveDB(body);
      return res.status(200).json({ ok: true, lastUpdated: body.lastUpdated });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
