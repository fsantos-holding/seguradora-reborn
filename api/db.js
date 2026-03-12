const { kv } = require("@vercel/kv");
const fs = require("fs");
const path = require("path");

const DB_KEY = "backlog_reborn_db";

// Load seed data from data/db.json
function getSeed() {
  const seedPath = path.join(__dirname, "..", "data", "db.json");
  return JSON.parse(fs.readFileSync(seedPath, "utf-8"));
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      let data = await kv.get(DB_KEY);
      if (!data) {
        // First time: seed from db.json
        data = getSeed();
        await kv.set(DB_KEY, data);
      }
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body || !body.cards || !body.config) {
        return res.status(400).json({ error: "Estrutura JSON inválida. Necessário: cards e config." });
      }
      body.lastUpdated = new Date().toISOString();
      await kv.set(DB_KEY, body);
      return res.status(200).json({ ok: true, lastUpdated: body.lastUpdated });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("DB API Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
