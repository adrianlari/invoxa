import { pgTable, text, decimal, boolean } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.ts";

export const taxRates = pgTable("TaxRate", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  rate: decimal("rate", { precision: 5, scale: 2 }).notNull(),
  country: text("country").notNull(),
  isDefault: boolean("isDefault").notNull().default(false),
});
