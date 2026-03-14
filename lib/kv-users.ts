import { kv } from "@vercel/kv";
import { hashPassword } from "./auth";

const USERS_KEY = "reborn_users";
const USER_PREFIX = "reborn_user:";
const USER_BY_EMAIL = "reborn_user_email:";
const USER_BY_USERNAME = "reborn_user_username:";

const ADMIN_USER = {
  id: "admin",
  username: "Admin",
  name: "Admin",
  email: "admin@reborn.local",
  passwordHash: null as string | null,
  isAdmin: true,
};

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  passwordHash: string | null;
  isAdmin: boolean;
}

export async function ensureAdminUser(): Promise<User | null> {
  const raw = await kv.get(USER_PREFIX + "admin");
  if (raw) {
    const existing = (typeof raw === "string" ? JSON.parse(raw) : raw) as User;
    if (!existing.isAdmin) {
      existing.isAdmin = true;
      await kv.set(USER_PREFIX + "admin", JSON.stringify(existing));
    }
    return existing;
  }

  const admin: User = {
    ...ADMIN_USER,
    passwordHash: hashPassword("Admin"),
  };
  await kv.set(USER_PREFIX + "admin", JSON.stringify(admin));
  await kv.set(USER_BY_USERNAME + "Admin".toLowerCase(), "admin");
  await kv.set(USER_BY_EMAIL + "admin@reborn.local".toLowerCase(), "admin");
  const users = ((await kv.get(USERS_KEY)) as string[]) || [];
  if (!users.includes("admin")) {
    users.unshift("admin");
    await kv.set(USERS_KEY, users);
  }
  return admin;
}

export async function getUserById(id: string): Promise<User | null> {
  const raw = await kv.get(USER_PREFIX + id);
  if (!raw) return null;
  return (typeof raw === "string" ? JSON.parse(raw) : raw) as User;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const id = await kv.get<string>(USER_BY_USERNAME + (username || "").toLowerCase());
  if (!id) return null;
  return getUserById(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const id = await kv.get<string>(USER_BY_EMAIL + (email || "").toLowerCase());
  if (!id) return null;
  return getUserById(id);
}

export async function createUser(user: {
  username: string;
  name: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  const id = "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  const doc: User = {
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
  const users = ((await kv.get(USERS_KEY)) as string[]) || [];
  users.push(id);
  await kv.set(USERS_KEY, users);
  return doc;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
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

export async function listUsers(): Promise<{ id: string; username: string; name: string; email: string; isAdmin: boolean }[]> {
  await ensureAdminUser();
  const ids = ((await kv.get(USERS_KEY)) as string[]) || [];
  const users = [];
  for (const id of ids) {
    const u = await getUserById(id);
    if (u) users.push({ id: u.id, username: u.username, name: u.name, email: u.email, isAdmin: !!u.isAdmin });
  }
  return users;
}

export async function deleteUser(id: string): Promise<void> {
  const user = await getUserById(id);
  if (!user) return;
  await kv.del(USER_PREFIX + id);
  await kv.del(USER_BY_EMAIL + (user.email || "").toLowerCase());
  await kv.del(USER_BY_USERNAME + (user.username || "").toLowerCase());
  const users = ((await kv.get(USERS_KEY)) as string[]) || [];
  await kv.set(USERS_KEY, users.filter((u) => u !== id));
}
