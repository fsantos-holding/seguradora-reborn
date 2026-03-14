const { verifyPassword, createToken } = require("../lib/auth");
const { getUserByUsername, ensureAdminUser } = require("../lib/kv-users");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store");
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await ensureAdminUser();
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body || "{}");

    const { username, password } = body;
    if (!username || !password) {
      return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
    }

    const { getUserByEmail } = require("../lib/kv-users");
    const ident = (username || "").trim();
    const user = ident.includes("@")
      ? await getUserByEmail(ident)
      : await getUserByUsername(ident);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }

    const token = createToken(user);
    return res.status(200).json({
      token,
      user: { id: user.id, username: user.username, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message });
  }
};
