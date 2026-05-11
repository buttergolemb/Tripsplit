// Postgres-backed data layer for TripSplit.
//
// Connects via DATABASE_URL (e.g. postgres://user:pass@host:5432/tripsplit).
// On boot we apply schema.sql idempotently; everything in there uses
// IF NOT EXISTS or ON CONFLICT semantics so re-running is safe.
//
// Repos and seed scripts go through `query` / `queryOne` / `tx` so the rest
// of the app never sees `pg.Pool` directly. `tx(fn)` checks out a single
// client, runs everything inside BEGIN…COMMIT, and rolls back on throw.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Postgres returns BIGINT (oid 20) and NUMERIC (oid 1700) as strings by
// default to avoid 64-bit precision loss. Every numeric column we use here
// (cents, epoch seconds, vote counts) fits comfortably in a JS number, so
// we coerce them up front and let the repo layer keep working with `number`.
pg.types.setTypeParser(20, (val) => (val === null ? null : Number(val)));
pg.types.setTypeParser(1700, (val) => (val === null ? null : Number(val)));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Provide a Postgres connection string " +
    "(e.g. postgres://user:password@localhost:5432/tripsplit). See .env.example.",
  );
}

const SCHEMA_PATH = path.join(__dirname, "schema.sql");

// Hosted Postgres (Render, Railway, Supabase, Heroku) terminates TLS in
// front of the database; opt in to SSL when the connection string asks for
// it OR PGSSLMODE is set to require/verify-*. For local dev (plain
// `postgres://localhost`) we leave SSL off.
function shouldUseSsl(): pg.PoolConfig["ssl"] {
  const sslMode = (process.env.PGSSLMODE || "").toLowerCase();
  if (sslMode === "disable" || sslMode === "allow") return undefined;
  if (sslMode === "require" || sslMode === "verify-ca" || sslMode === "verify-full") {
    return { rejectUnauthorized: sslMode === "verify-full" };
  }
  // Heuristic: providers that require TLS usually include ?sslmode=require
  // in the URL, or the host isn't localhost.
  if (DATABASE_URL!.includes("sslmode=require")) return { rejectUnauthorized: false };
  if (DATABASE_URL!.includes("sslmode=no-verify")) return { rejectUnauthorized: false };
  return undefined;
}

export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: shouldUseSsl(),
});

pool.on("error", (err) => {
  console.error("[tripsplit] unexpected pg pool error", err);
});

// ─── Query helpers ──────────────────────────────────────────────────────────
// Thin wrappers so call-sites read like SQLite's prepare/get/all/run.

export type SqlParam = string | number | boolean | null | Date;

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: readonly SqlParam[] = [],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(sql, params as SqlParam[]);
}

export async function queryOne<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: readonly SqlParam[] = [],
): Promise<T | null> {
  const result = await pool.query<T>(sql, params as SqlParam[]);
  return result.rows[0] ?? null;
}

// Querier interface used inside transactions. Callers can use the same
// shape (`q.query`, `q.queryOne`) whether or not they're inside a tx, which
// keeps repo helpers composable.
export interface Querier {
  query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    sql: string, params?: readonly SqlParam[],
  ): Promise<pg.QueryResult<T>>;
  queryOne<T extends pg.QueryResultRow = pg.QueryResultRow>(
    sql: string, params?: readonly SqlParam[],
  ): Promise<T | null>;
}

function clientQuerier(client: pg.PoolClient): Querier {
  return {
    async query(sql, params = []) {
      return client.query(sql, params as SqlParam[]);
    },
    async queryOne(sql, params = []) {
      const r = await client.query(sql, params as SqlParam[]);
      return r.rows[0] ?? null;
    },
  };
}

export async function tx<T>(fn: (q: Querier) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(clientQuerier(client));
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch { /* ignore */ }
    throw err;
  } finally {
    client.release();
  }
}

// Top-level (non-transactional) querier, useful when a repo helper is called
// directly outside a transaction.
export const root: Querier = {
  query,
  queryOne,
};

// ─── Schema bootstrap ───────────────────────────────────────────────────────
// schema.sql contains every CREATE TABLE / INDEX. It's split into
// statements before being executed so a syntax error in one statement
// reports a useful location rather than failing silently.

export async function applySchema(): Promise<void> {
  const raw = fs.readFileSync(SCHEMA_PATH, "utf8");
  // Strip line comments before splitting on `;` so SQL inside comments
  // doesn't get treated as a statement boundary.
  const cleaned = raw
    .split("\n")
    .map((line) => (line.trim().startsWith("--") ? "" : line))
    .join("\n");
  const statements = cleaned
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await pool.query(stmt);
    } catch (err) {
      const preview = stmt.slice(0, 120).replace(/\s+/g, " ");
      throw new Error(
        `Failed applying schema statement: "${preview}"…\n` +
        (err instanceof Error ? err.message : String(err)),
      );
    }
  }
}

export function databaseHost(): string {
  // Best-effort display of the host so logs don't spill credentials.
  try {
    const u = new URL(DATABASE_URL!);
    return `${u.hostname}${u.port ? `:${u.port}` : ""}${u.pathname}`;
  } catch {
    return "(invalid DATABASE_URL)";
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
}
