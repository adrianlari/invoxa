import { jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.ts";

export const orgRoleEnum = pgEnum("OrgRole", ["OWNER", "ADMIN", "MEMBER"]);
export const integrationTypeEnum = pgEnum("IntegrationType", ["AMAZON", "SHOPIFY", "TEMU", "WOOCOMMERCE", "ETSY", "EBAY"]);
export const integrationStatusEnum = pgEnum("IntegrationStatus", ["PENDING", "ACTIVE", "ERROR", "DISCONNECTED"]);

export const integrations = pgTable(
  "Integration",
  {
    id: text("id").primaryKey(),
    organizationId: text("organizationId")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    type: integrationTypeEnum("type").notNull(),
    status: integrationStatusEnum("status").notNull().default("PENDING"),
    credentials: jsonb("credentials").notNull(),
    settings: jsonb("settings"),
    lastSyncAt: timestamp("lastSyncAt", { withTimezone: true }),
    syncCursor: text("syncCursor"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("Integration_organizationId_type_key").on(t.organizationId, t.type)],
);
