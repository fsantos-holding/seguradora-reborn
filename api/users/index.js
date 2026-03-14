const { getAuthFromRequest } = require("../lib/auth");
const { listUsers, createUser, ensureAdminUser } = require("../lib/kv-users");
const { hashPassword } = require("../lib/auth");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
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

  try {
    await ensureAdminUser();

    if (req.method === "GET") {
      const users = await listUsers();
      return res.status(200).json({ users });
    }

    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body || "{}");
      const { name, email, password } = body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" });
      }
      const { getUserByEmail } = require("../lib/kv-users");
      const emailNorm = (email || "").trim().toLowerCase();
      if (await getUserByEmail(emailNorm)) {
        return res.status(400).json({ error: "E-mail já cadastrado" });
      }
      const user = await createUser({
        username: emailNorm,
        name: (name || "").trim(),
        email: emailNorm,
        passwordHash: hashPassword(password),
      });
      return res.status(201).json({
        user: { id: user.id, username: user.username, name: user.name, email: user.email, isAdmin: false },
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Users API error:", err);
    return res.status(500).json({ error: err.message });
  }
};
