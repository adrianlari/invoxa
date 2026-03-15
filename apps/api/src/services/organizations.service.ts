import { eq } from "drizzle-orm";
import { db } from "../db/client.ts";
import { organizations } from "../db/schemas/organizations.ts";

export const organizationsService = {
  async getCurrent(organizationId: string) {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);
    return org ?? null;
  },

  async updateCurrent(organizationId: string, data: Record<string, unknown>) {
    const [org] = await db
      .update(organizations)
      .set({ ...(data as any), updatedAt: new Date() })
      .where(eq(organizations.id, organizationId))
      .returning();
    return org;
  },

  async uploadLogo(organizationId: string, logoUrl: string) {
    const [org] = await db
      .update(organizations)
      .set({ logoUrl, updatedAt: new Date() })
      .where(eq(organizations.id, organizationId))
      .returning();
    return org;
  },
};
