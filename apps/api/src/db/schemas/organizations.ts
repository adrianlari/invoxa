import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const organizations = pgTable("Organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logoUrl"),
  legalName: text("legalName"),
  vatId: text("vatId"),
  taxNumber: text("taxNumber"),
  address: jsonb("address").notNull(),
  defaultCurrency: text("defaultCurrency").notNull().default("EUR"),
  invoicePrefix: text("invoicePrefix").notNull().default("INV"),
  nextInvoiceNumber: integer("nextInvoiceNumber").notNull().default(1),
  defaultPaymentTermsDays: integer("defaultPaymentTermsDays").notNull().default(14),
  onboardingComplete: boolean("onboardingComplete").notNull().default(false),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});
