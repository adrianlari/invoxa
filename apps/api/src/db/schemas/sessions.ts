import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const sessions = pgTable("Session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
});
