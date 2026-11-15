import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cmsConfigured, SESSION_COOKIE, SESSION_DAYS } from "./config";
import { exec, select } from "./db";
import { DUMMY_HASH, verifyPassword } from "./password";

export type AdminCheck =
  | { state: "unconfigured" }
  | { state: "signed-out" }
  | { state: "forbidden"; email: string }
  | { state: "admin"; email: string; userId: string };

const tokenHash = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

/**
 * Verifies the session cookie against the sessions table on every call and the
 * admin's status, entirely on the server. Never cached or prerendered.
 */
export async function checkAdmin(): Promise<AdminCheck> {
  await connection();
  if (!cmsConfigured) return { state: "unconfigured" };
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length < 32) return { state: "signed-out" };
  const rows = await select<{ id: string; email: string; disabled: number }>(
    "SELECT a.id, a.email, a.disabled FROM sessions s JOIN admins a ON a.id = s.admin_id WHERE s.token_hash = ? AND s.expires_at > NOW(3)",
    [tokenHash(token)],
  );
  const admin = rows[0];
  if (!admin) return { state: "signed-out" };
  if (admin.disabled) return { state: "forbidden", email: admin.email };
  return { state: "admin", email: admin.email, userId: admin.id };
}

export async function requireAdminPage() {
  const check = await checkAdmin();
  if (check.state === "signed-out") redirect("/admin/login");
  return check;
}

/** For admin pages: true only for a verified admin. Pages render nothing otherwise. */
export async function isAdminRequest() {
  return (await checkAdmin()).state === "admin";
}

/** For server actions and route handlers: throws unless the caller is an admin. */
export async function requireAdmin() {
  const check = await checkAdmin();
  if (check.state !== "admin") throw new Error(check.state === "unconfigured" ? "The database is not configured." : "Not authorized.");
  return check;
}

/** Checks credentials and starts a session. Returns false for any mismatch (no detail leaked). */
export async function startSession(email: string, password: string) {
  const rows = await select<{ id: string; password_hash: string; disabled: number }>("SELECT id, password_hash, disabled FROM admins WHERE email = ?", [email.trim().toLowerCase()]);
  const admin = rows[0];
  const ok = await verifyPassword(password, admin?.password_hash ?? DUMMY_HASH);
  if (!admin || !ok || admin.disabled) return false;
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await exec("DELETE FROM sessions WHERE expires_at < NOW(3)");
  await exec("INSERT INTO sessions (token_hash, admin_id, expires_at) VALUES (?, ?, ?)", [tokenHash(token), admin.id, expires]);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_LOCAL_COOKIES !== "true",
    path: "/",
    expires,
  });
  return true;
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && cmsConfigured) await exec("DELETE FROM sessions WHERE token_hash = ?", [tokenHash(token)]);
  store.delete(SESSION_COOKIE);
}
