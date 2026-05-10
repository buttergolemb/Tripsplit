import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project-root-relative path so `data.sqlite` lives alongside package.json.
const DB_PATH = process.env.TRIPSPLIT_DB ?? path.join(__dirname, "..", "data.sqlite");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

export const db = new Database(DB_PATH);

// Sensible defaults for a small server.
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Apply schema on every boot (idempotent — statements use IF NOT EXISTS).
const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
db.exec(schema);

export function dbPath() {
  return DB_PATH;
}
