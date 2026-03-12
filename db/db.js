const { kv } = require("@vercel/kv");
const fs = require("fs");
const path = require("path");

const DB_KEY = "backlog_reborn_db_v2";

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
      // Read from KV - stored as JSON string
      let raw = await kv.get(DB_KEY);

      if (!raw) {
        // First time ever: seed from file
        const seed = getSeed();
        seed.lastUpdated = new Date().toISOString();
        // Store as string to avoid KV serialization issues
        await kv.set(DB_KEY, JSON.stringify(seed));
        return res.status(200).json(seed);
      }

      // KV may return object or string depending on how it was stored
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      // Parse body
      let body;
      if (typeof req.body === "string") {
        body = JSON.parse(req.body);
      } else if (req.body && typeof req.body === "object") {
        body = req.body;
      } else {
        return res.status(400).json({ error: "Body vazio ou inválido" });
      }

      if (!body.cards || !body.config) {
        return res.status(400).json({ error: "Estrutura inválida: cards e config obrigatórios" });
      }

      body.lastUpdated = new Date().toISOString();

      // Store as string to guarantee integrity
      await kv.set(DB_KEY, JSON.stringify(body));

      return res.status(200).json({
        ok: true,
        lastUpdated: body.lastUpdated,
        cardsCount: body.cards.length
      });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("API /api/db error:", err);
    return res.status(500).json({
      error: err.message,
      hint: "Verifique se o Vercel KV está conectado ao projeto (Storage → Connect)"
    });
  }
};
