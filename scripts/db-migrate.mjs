// Applies db/migrations/*.sql in order, once each. Run: npm run db:migrate
// Reads DATABASE_URL (and DATABASE_SSL) from the environment or .env.local.
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { loadEnv } from "./env.mjs";

loadEnv();
const url = process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL in .env.local (see .env.example).");

const dir = path.resolve("db/migrations");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const conn = await mysql.createConnection({ uri: url, multipleStatements: true, ...(process.env.DATABASE_SSL === "true" ? { ssl: { rejectUnauthorized: true } } : {}) });
try {
  await conn.query("CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(191) PRIMARY KEY, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)) ENGINE=InnoDB");
  const [rows] = await conn.query("SELECT name FROM schema_migrations");
  const done = new Set(rows.map((r) => r.name));
  for (const file of files) {
    if (done.has(file)) continue;
    await conn.query(fs.readFileSync(path.join(dir, file), "utf8"));
    await conn.execute("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
    console.log(`applied ${file}`);
  }
  console.log("database is up to date");
} finally {
  await conn.end();
}
