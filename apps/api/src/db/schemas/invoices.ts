import { pgTable, text, timestamp, decimal, jsonb, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.ts";
import { customers } from "./customers.ts";

export const invoiceStatusEnum = pgEnum("InvoiceStatus", ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED", "REFUNDED"]);

export const invoices = pgTable(
  "Invoice",
  {
    id: text("id").primaryKey(),
    organizationId: text("organizationId")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    customerId: text("customerId")
      .notNull()
      .references(() => customers.id),
    invoiceNumber: text("invoiceNumber").notNull(),
    status: invoiceStatusEnum("status").notNull().default("DRAFT"),
    issueDate: timestamp("issueDate", { withTimezone: true }).defaultNow().notNull(),
    dueDate: timestamp("dueDate", { withTimezone: true }),
    currency: text("currency").notNull().default("EUR"),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    taxTotal: decimal("taxTotal", { precision: 10, scale: 2 }).notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    notes: text("notes"),
    pdfUrl: text("pdfUrl"),
    sentAt: timestamp("sentAt", { withTimezone: true }),
    paidAt: timestamp("paidAt", { withTimezone: true }),
    externalOrderId: text("externalOrderId"),
    source: text("source"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("Invoice_organizationId_invoiceNumber_key").on(t.organizationId, t.invoiceNumber)],
);

export const invoiceLineItems = pgTable("InvoiceLineItem", {
  id: text("id").primaryKey(),
  invoiceId: text("invoiceId")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 4 }).notNull(),
  taxRate: decimal("taxRate", { precision: 5, scale: 2 }).notNull(),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  sku: text("sku"),
});
