import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "../db/client.ts";
import { organizations } from "../db/schemas/organizations.ts";
import { taxRates } from "../db/schemas/tax-rates.ts";
import { integrations } from "../db/schemas/integrations.ts";

export const onboardingService = {
  async getState(orgId: string) {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
    if (!org)
      return {
        organization: null,
        completed: false,
        steps: { company: false, branding: false, tax: false, integrations: false, preview: false },
      };

    const [taxCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(taxRates)
      .where(eq(taxRates.organizationId, orgId));

    const [integrationCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(integrations)
      .where(eq(integrations.organizationId, orgId));

    return {
      organization: org,
      completed: org.onboardingComplete,
      steps: {
        company: Boolean(org.legalName),
        branding: Boolean(org.invoicePrefix),
        tax: Number(taxCount?.count ?? 0) > 0,
        integrations: Number(integrationCount?.count ?? 0) > 0,
        preview: false,
      },
    };
  },

  async completeStep(orgId: string, step: string, data: Record<string, unknown>) {
    if (["company", "branding"].includes(step)) {
      await db
        .update(organizations)
        .set({ ...(data as any), updatedAt: new Date() })
        .where(eq(organizations.id, orgId));
    }

    if (step === "tax" && Array.isArray(data.rates)) {
      const values = data.rates.map((r: any) => ({
        id: randomUUID(),
        organizationId: orgId,
        name: String(r.name),
        rate: String(r.rate),
        country: String(r.country),
        isDefault: Boolean(r.isDefault),
      }));
      if (values.length > 0) await db.insert(taxRates).values(values);
    }

    return onboardingService.getState(orgId);
  },

  async validateVatId(vatId: string) {
    return { valid: /^[A-Z]{2}[A-Z0-9]{8,12}$/.test(vatId), companyName: "Validated Company (stub)" };
  },

  async complete(orgId: string) {
    await db.update(organizations).set({ onboardingComplete: true, updatedAt: new Date() }).where(eq(organizations.id, orgId));
    return { success: true };
  },
};
