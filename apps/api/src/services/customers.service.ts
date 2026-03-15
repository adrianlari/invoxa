import { randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client.ts";
import { customers } from "../db/schemas/customers.ts";
import { invoices } from "../db/schemas/invoices.ts";

export const customersService = {
  async list(organizationId: string) {
    return await db.select().from(customers).where(eq(customers.organizationId, organizationId)).orderBy(desc(customers.createdAt));
  },

  async create(organizationId: string, data: Record<string, unknown>) {
    const [customer] = await db
      .insert(customers)
      .values({
        id: randomUUID(),
        organizationId,
        name: String(data.name ?? "Customer"),
        email: data.email ? String(data.email) : null,
        company: data.company ? String(data.company) : null,
        vatId: data.vatId ? String(data.vatId) : null,
        source: data.source ? String(data.source) : null,
        externalId: data.externalId ? String(data.externalId) : null,
        address: (data.address as any) ?? {},
      })
      .returning();

    return customer;
  },

  async getById(organizationId: string, id: string) {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.organizationId, organizationId)))
      .limit(1);

    if (!customer) return null;

    const customerInvoices = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.customerId, id), eq(invoices.organizationId, organizationId)));
    return { ...customer, invoices: customerInvoices };
  },

  async update(organizationId: string, id: string, data: Record<string, unknown>) {
    const [customer] = await db
      .update(customers)
      .set({ ...(data as any), updatedAt: new Date() })
      .where(and(eq(customers.id, id), eq(customers.organizationId, organizationId)))
      .returning();

    if (!customer) throw new Error("Customer not found");
    return customer;
  },
};
