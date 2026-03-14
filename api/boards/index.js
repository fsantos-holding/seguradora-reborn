const { getAuthFromRequest } = require("../lib/auth");
const { getBoardIds, getBoard, createBoard } = require("../lib/kv-boards");
const fs = require("fs");
const path = require("path");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store");
}

function getDefaultBoardData() {
  const dataDir = path.join(__dirname, "..", "..", "data");
  const jsonPath = path.join(dataDir, "db.json");
  const jsPath = path.join(dataDir, "db.js");
  const seedPath = fs.existsSync(jsonPath) ? jsonPath : jsPath;
  const raw = fs.readFileSync(seedPath, "utf-8");
  const seed = JSON.parse(raw);
  return {
    version: "2.0",
    cards: seed.cards || [],
    config: seed.config || { bucketOrder: [], collapsedColumns: [] },
    mapaProducao: seed.mapaProducao || [],
  };
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const payload = getAuthFromRequest(req);
  if (!payload) return res.status(401).json({ error: "Não autenticado" });

  try {
    const boardIds = await getBoardIds(payload.id, payload.isAdmin);

    if (req.method === "GET") {
      const boards = [];
      for (const bid of boardIds) {
        const b = await getBoard(bid);
        if (b) boards.push({ id: b.id, name: b.name, ownerId: b.ownerId, lastUpdated: b.lastUpdated });
      }
      return res.status(200).json({ boards });
    }

    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body || "{}");
      const name = (body.name || "Novo Board").trim().slice(0, 100);
      const defaultData = getDefaultBoardData();
      const board = await createBoard(payload.id, name, defaultData);
      return res.status(201).json({
        board: { id: board.id, name: board.name, ownerId: board.ownerId, lastUpdated: board.lastUpdated },
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Boards API error:", err);
    return res.status(500).json({ error: err.message });
  }
};
