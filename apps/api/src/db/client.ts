import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schemas";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

/**
 * Sets the RLS context for the current transaction/connection.
 * Must be called within a transaction or with a dedicated connection.
 */
export async function setRlsContext(organizationId: string) {
  // Use parameterized query to prevent SQL injection
  await pool.query("SELECT set_config('app.current_org_id', $1, true)", [organizationId]);
}
