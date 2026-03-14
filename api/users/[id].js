const { getAuthFromRequest } = require("../lib/auth");
const { getUserById, updateUser, listUsers, ensureAdminUser } = require("../lib/kv-users");
const { hashPassword } = require("../lib/auth");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store");
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const payload = getAuthFromRequest(req);
  if (!payload || !payload.isAdmin) {
    return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
  }

  const id = req.query.id || (req.url && req.url.split("/").pop()?.split("?")[0]);
  if (!id || id === "users") return res.status(400).json({ error: "ID do usuário é obrigatório" });

  if (id === "admin") {
    return res.status(400).json({ error: "O usuário Admin não pode ser alterado ou excluído" });
  }

  try {
    await ensureAdminUser();

    if (req.method === "GET") {
      const user = await getUserById(id);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
      return res.status(200).json({
        user: { id: user.id, username: user.username, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
      });
    }

    if (req.method === "PUT") {
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body || "{}");
      const updates = {};
      if (body.name !== undefined) updates.name = (body.name || "").trim();
      if (body.email !== undefined) updates.email = (body.email || "").trim().toLowerCase();
      if (body.password !== undefined && body.password.length >= 4) {
        updates.passwordHash = hashPassword(body.password);
      }
      const user = await updateUser(id, updates);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
      return res.status(200).json({
        user: { id: user.id, username: user.username, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
      });
    }

    if (req.method === "DELETE") {
      const user = await getUserById(id);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
      const { kv } = require("@vercel/kv");
      const USERS_KEY = "reborn_users";
      const USER_PREFIX = "reborn_user:";
      const USER_BY_EMAIL = "reborn_user_email:";
      const USER_BY_USERNAME = "reborn_user_username:";
      await kv.del(USER_PREFIX + id);
      await kv.del(USER_BY_EMAIL + (user.email || "").toLowerCase());
      await kv.del(USER_BY_USERNAME + (user.username || "").toLowerCase());
      const users = (await kv.get(USERS_KEY)) || [];
      await kv.set(USERS_KEY, users.filter((u) => u !== id));
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("User API error:", err);
    return res.status(500).json({ error: err.message });
  }
};
