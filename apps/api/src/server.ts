import "dotenv/config";
import { createApp } from "./app.ts";
import { pool } from "./db/client.ts";

const port = Number(process.env.PORT ?? 3001);
const app = createApp();

const start = async () => {
  await pool.query("select 1");

  const host = process.env.HOST ?? "0.0.0.0";
  app.listen(port, host, () => {
    console.log(`API listening on http://${host}:${port}`);
  });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
