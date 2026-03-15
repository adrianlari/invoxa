import "dotenv/config";
import { AsyncLocalStorage } from "node:async_hooks";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolClient } from "pg";
import * as schema from "./schemas/index.ts";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export type AppDb = NodePgDatabase<typeof schema>;

const sharedDb = drizzle(pool, { schema });

const requestStorage = new AsyncLocalStorage<{ db: AppDb }>();

/**
 * Returns the request-scoped drizzle instance (with RLS context) if available,
 * otherwise falls back to the shared pool-based instance.
 */
export function getDb(): AppDb {
  const store = requestStorage.getStore();
  return store?.db ?? sharedDb;
}

/**
 * Acquires a dedicated pool client, starts a transaction, sets the RLS
 * org context, then runs `fn` inside that scope. All calls to `getDb()`
 * within `fn` (and its async descendants) will use this scoped connection.
 */
export async function withRlsContext<T>(organizationId: string, fn: () => Promise<T>): Promise<T> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.current_org_id', $1, true)", [organizationId]);

    const scopedDb = drizzle(client, { schema }) as AppDb;

    return await requestStorage.run({ db: scopedDb }, fn);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    await client.query("COMMIT").catch(() => {});
    client.release();
  }
}

// Keep backward compat — the shared instance for non-request contexts (migrations, scripts)
export const db = sharedDb;
