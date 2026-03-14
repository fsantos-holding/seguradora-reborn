const { getAuthFromRequest } = require("../lib/auth");
const { getUserById, ensureAdminUser } = require("../lib/kv-users");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store");
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    await ensureAdminUser();
    const payload = getAuthFromRequest(req);
    if (!payload) return res.status(401).json({ error: "Não autenticado" });

    const user = await getUserById(payload.id);
    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

    return res.status(200).json({
      user: { id: user.id, username: user.username, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
    });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ error: err.message });
  }
};
