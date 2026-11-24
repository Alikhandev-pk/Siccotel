// Provision an admin (invite-only; there is no public sign-up). Run from the project root:
//   npm run admin:create -- admin@example.com "a-long-unique-password"
// Creates the admin, or resets the password and re-enables an existing one.
import crypto from "node:crypto";
import mysql from "mysql2/promise";
import { loadEnv } from "./env.mjs";

loadEnv();
const [email, password] = process.argv.slice(2);
if (!email || !password) throw new Error('Usage: npm run admin:create -- <email> "<password>"');
if (password.length < 12) throw new Error("Use a password of at least 12 characters.");
if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL in .env.local (see .env.example).");

// Read by verifyPassword in src/lib/cms/password.ts: scrypt$N$r$p$salt$hash (base64)
const N = 16384, r = 8, p = 1;
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 64, { N, r, p });
const stored = `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${hash.toString("base64")}`;

const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL, ...(process.env.DATABASE_SSL === "true" ? { ssl: { rejectUnauthorized: true } } : {}) });
try {
  await conn.query("SET time_zone = '+00:00'");
  const normalized = email.trim().toLowerCase();
  const [rows] = await conn.execute("SELECT id FROM admins WHERE email = ?", [normalized]);
  if (rows.length) {
    await conn.execute("UPDATE admins SET password_hash = ?, disabled = 0 WHERE id = ?", [stored, rows[0].id]);
    await conn.execute("DELETE FROM sessions WHERE admin_id = ?", [rows[0].id]);
    console.log(`Updated the password for ${normalized} and signed out its old sessions.`);
  } else {
    await conn.execute("INSERT INTO admins (id, email, password_hash) VALUES (?, ?, ?)", [crypto.randomUUID(), normalized, stored]);
    console.log(`Created admin ${normalized}. Sign in at /admin/login.`);
  }
} finally {
  await conn.end();
}
