import "dotenv/config";
import { createApp } from "./app.ts";
import { pool } from "./db/client.ts";

const port = Number(process.env.PORT ?? 3001);
const app = createApp();

const start = async () => {
  await pool.query("select 1");

  app.listen(port, "127.0.0.1", () => {
    console.log(`API listening on http://127.0.0.1:${port}`);
  });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
