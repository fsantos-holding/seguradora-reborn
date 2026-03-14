const { kv } = require("@vercel/kv");

const USERS_KEY = "reborn_users";
const USER_PREFIX = "reborn_user:";
const USER_BY_EMAIL = "reborn_user_email:";
const USER_BY_USERNAME = "reborn_user_username:";

const ADMIN_USER = {
  id: "admin",
  username: "Admin",
  name: "Admin",
  email: "admin@reborn.local",
  passwordHash: null,
  isAdmin: true,
};

async function ensureAdminUser() {
  const users = await kv.get(USERS_KEY);
  if (!users || users.length === 0) {
    const { hashPassword } = require("./auth");
    const admin = {
      ...ADMIN_USER,
      passwordHash: hashPassword("Admin"),
    };
    await kv.set(USER_PREFIX + "admin", JSON.stringify(admin));
    await kv.set(USER_BY_USERNAME + "Admin".toLowerCase(), "admin");
    await kv.set(USER_BY_EMAIL + "admin@reborn.local".toLowerCase(), "admin");
    await kv.set(USERS_KEY, ["admin"]);
    return admin;
  }
  return null;
}

async function getUserById(id) {
  const raw = await kv.get(USER_PREFIX + id);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

async function getUserByUsername(username) {
  const id = await kv.get(USER_BY_USERNAME + (username || "").toLowerCase());
  if (!id) return null;
  return getUserById(id);
}

async function getUserByEmail(email) {
  const id = await kv.get(USER_BY_EMAIL + (email || "").toLowerCase());
  if (!id) return null;
  return getUserById(id);
}

async function createUser(user) {
  const id = "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  const doc = {
    id,
    username: user.username,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    isAdmin: false,
  };
  await kv.set(USER_PREFIX + id, JSON.stringify(doc));
  await kv.set(USER_BY_USERNAME + user.username.toLowerCase(), id);
  await kv.set(USER_BY_EMAIL + user.email.toLowerCase(), id);
  const users = (await kv.get(USERS_KEY)) || [];
  users.push(id);
  await kv.set(USERS_KEY, users);
  return doc;
}

async function updateUser(id, updates) {
  const user = await getUserById(id);
  if (!user) return null;
  if (updates.username !== undefined) {
    await kv.del(USER_BY_USERNAME + user.username.toLowerCase());
    user.username = updates.username;
    await kv.set(USER_BY_USERNAME + user.username.toLowerCase(), id);
  }
  if (updates.email !== undefined) {
    await kv.del(USER_BY_EMAIL + user.email.toLowerCase());
    user.email = updates.email;
    await kv.set(USER_BY_EMAIL + user.email.toLowerCase(), id);
  }
  if (updates.name !== undefined) user.name = updates.name;
  if (updates.passwordHash !== undefined) user.passwordHash = updates.passwordHash;
  await kv.set(USER_PREFIX + id, JSON.stringify(user));
  return user;
}

async function listUsers() {
  await ensureAdminUser();
  const ids = (await kv.get(USERS_KEY)) || [];
  const users = [];
  for (const id of ids) {
    const u = await getUserById(id);
    if (u) users.push({ id: u.id, username: u.username, name: u.name, email: u.email, isAdmin: !!u.isAdmin });
  }
  return users;
}

module.exports = {
  ensureAdminUser,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  createUser,
  updateUser,
  listUsers,
};
