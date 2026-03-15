import { organizations } from "./organizations.ts";
import { jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const customers = pgTable(
  "Customer",
  {
    id: text("id").primaryKey(),
    organizationId: text("organizationId")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    externalId: text("externalId"),
    source: text("source"),
    email: text("email"),
    name: text("name").notNull(),
    company: text("company"),
    vatId: text("vatId"),
    address: jsonb("address").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("Customer_organizationId_externalId_source_key").on(t.organizationId, t.externalId, t.source)],
);
