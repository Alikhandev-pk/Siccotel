import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { databaseSsl, databaseUrl } from "./config";

/** One pool per server process (kept across dev hot reloads). */
const globalForDb = globalThis as unknown as { siccotelPool?: Pool };

export function pool(): Pool {
  if (!databaseUrl) throw new Error("DATABASE_URL is not set.");
  if (globalForDb.siccotelPool) return globalForDb.siccotelPool;
  globalForDb.siccotelPool = mysql.createPool({
    uri: databaseUrl,
    connectionLimit: 5,
    waitForConnections: true,
    // JSON columns are stored as text and parsed in code, so MySQL and MariaDB behave the same.
    supportBigNumbers: true,
    dateStrings: true,
    // Timestamps are UTC end to end: Date parameters are sent as UTC and the session
    // clock (NOW(), column defaults) runs in UTC, whatever the server zone is.
    timezone: "Z",
    ...(databaseSsl ? { ssl: { rejectUnauthorized: true } } : {}),
  });
  globalForDb.siccotelPool.pool.on("connection", (conn) => conn.query("SET time_zone = '+00:00'"));
  return globalForDb.siccotelPool;
}

/** Parameterised SELECT. Values are always passed separately from the SQL. */
export async function select<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await pool().execute<RowDataPacket[]>(sql, params as never[]);
  return rows as T[];
}

/** Parameterised INSERT/UPDATE/DELETE. */
export async function exec(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [result] = await pool().execute<ResultSetHeader>(sql, params as never[]);
  return result;
}

export function parseJson<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export const toJson = (value: unknown) => JSON.stringify(value ?? null);
/** The current time as a UTC DATETIME(3) string. */
export const nowSql = () => new Date().toISOString().slice(0, 23).replace("T", " ");

/** Reads a UTC DATETIME string from MySQL as a Date. */
export const fromSql = (value: string | null | undefined) => (value ? new Date(value.replace(" ", "T") + "Z") : null);
