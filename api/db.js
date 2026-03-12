const { kv } = require("@vercel/kv");
const fs = require("fs");
const path = require("path");

const DB_KEY = "backlog_reborn_db_v3";

function getSeed() {
  const seedPath = path.join(__dirname, "..", "data", "db.json");
  return JSON.parse(fs.readFileSync(seedPath, "utf-8"));
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      let raw = await kv.get(DB_KEY);
      if (!raw) {
        const seed = getSeed();
        seed.lastUpdated = new Date().toISOString();
        await kv.set(DB_KEY, JSON.stringify(seed));
        return res.status(200).json(seed);
      }
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      let body;
      if (typeof req.body === "string") body = JSON.parse(req.body);
      else if (req.body && typeof req.body === "object") body = req.body;
      else return res.status(400).json({ error: "Body vazio" });

      if (!body.cards || !body.config)
        return res.status(400).json({ error: "cards e config obrigatórios" });

      body.lastUpdated = new Date().toISOString();
      await kv.set(DB_KEY, JSON.stringify(body));
      return res.status(200).json({ ok: true, lastUpdated: body.lastUpdated, cardsCount: body.cards.length });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message, hint: "Verifique se Vercel KV está conectado" });
  }
};
