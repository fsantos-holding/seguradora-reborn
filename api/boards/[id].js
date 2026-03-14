const { getAuthFromRequest } = require("../lib/auth");
const {
  getBoard,
  updateBoard,
  deleteBoard,
  userCanAccessBoard,
} = require("../lib/kv-boards");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store");
}

function getBoardId(req) {
  return req.query.id || (req.url && req.url.split("/").pop()?.split("?")[0]);
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const payload = getAuthFromRequest(req);
  if (!payload) return res.status(401).json({ error: "Não autenticado" });

  const boardId = getBoardId(req);
  if (!boardId || boardId === "boards") return res.status(400).json({ error: "ID do board é obrigatório" });

  const canAccess = await userCanAccessBoard(payload.id, payload.isAdmin, boardId);
  if (!canAccess) return res.status(403).json({ error: "Sem permissão para este board" });

  try {
    if (req.method === "GET") {
      const board = await getBoard(boardId);
      if (!board) return res.status(404).json({ error: "Board não encontrado" });
      return res.status(200).json(board);
    }

    if (req.method === "PUT") {
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body || "{}");

      const updates = {};
      if (body.name !== undefined) updates.name = (body.name || "").trim().slice(0, 100);
      if (body.cards !== undefined) updates.cards = body.cards;
      if (body.config !== undefined) updates.config = body.config;
      if (body.mapaProducao !== undefined) updates.mapaProducao = body.mapaProducao;
      if (body.version !== undefined) updates.version = body.version;
      if (body.lastUpdated !== undefined) updates.lastUpdated = body.lastUpdated;

      const board = await updateBoard(boardId, updates);
      if (!board) return res.status(404).json({ error: "Board não encontrado" });
      return res.status(200).json({
        ok: true,
        lastUpdated: board.lastUpdated,
        cardsCount: (board.cards || []).length,
      });
    }

    if (req.method === "DELETE") {
      const ok = await deleteBoard(boardId, payload.id, payload.isAdmin);
      if (!ok) return res.status(404).json({ error: "Board não encontrado" });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Board API error:", err);
    return res.status(500).json({ error: err.message });
  }
};
