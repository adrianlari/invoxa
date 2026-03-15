import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.ts";
import { users } from "./users.ts";
import { orgRoleEnum } from "./integrations.ts";

export const orgMembers = pgTable(
  "OrgMember",
  {
    id: text("id").primaryKey(),
    organizationId: text("organizationId")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: orgRoleEnum("role").notNull().default("MEMBER"),
  },

  (t) => [uniqueIndex("OrgMember_organizationId_userId_key").on(t.organizationId, t.userId)],
);
