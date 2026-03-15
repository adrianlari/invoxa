import { decimal, pgTable, text } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.ts";
import { taxRates } from "./tax-rates.ts";

export const products = pgTable("Product", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sku: text("sku"),
  defaultPrice: decimal("defaultPrice", { precision: 10, scale: 4 }).notNull(),
  taxRateId: text("taxRateId").references(() => taxRates.id),
});
