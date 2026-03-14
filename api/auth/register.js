const { kv } = require("@vercel/kv");
const { hashPassword, createToken } = require("../lib/auth");
const { getUserByUsername, getUserByEmail, createUser, ensureAdminUser } = require("../lib/kv-users");

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

    const { name, email, password } = body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" });
    }

    const emailNorm = (email || "").trim().toLowerCase();
    const nameTrim = (name || "").trim().slice(0, 100);
    if (password.length < 4) {
      return res.status(400).json({ error: "Senha deve ter pelo menos 4 caracteres" });
    }

    if (await getUserByEmail(emailNorm)) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    const user = await createUser({
      username: emailNorm,
      name: nameTrim || emailNorm,
      email: emailNorm,
      passwordHash: hashPassword(password),
    });

    const token = createToken(user);
    return res.status(201).json({
      token,
      user: { id: user.id, username: user.username, name: user.name, email: user.email, isAdmin: false },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: err.message });
  }
};
