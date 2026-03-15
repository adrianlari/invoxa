import { randomUUID } from "crypto";
import { Decimal } from "decimal.js";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { createInvoiceSchema, type CreateInvoiceInput } from "@invoxa/shared";
import { db } from "../db/client.ts";
import { taxService } from "./tax.service.ts";
import { pdfService } from "./pdf.service.ts";
import { emailService } from "./email.service.ts";
import { customers } from "../db/schemas/customers.ts";
import { invoiceLineItems, invoices } from "../db/schemas/invoices.ts";
import { organizations } from "../db/schemas/organizations.ts";

async function hydrateInvoices(rows: any[]) {
  const customerIds = [...new Set(rows.map((invoice: any) => invoice.customerId))];
  const invoiceIds = rows.map((invoice: any) => invoice.id);

  const customerRows = customerIds.length ? await db.select().from(customers).where(inArray(customers.id, customerIds)) : [];
  const lineItemRows = invoiceIds.length
    ? await db.select().from(invoiceLineItems).where(inArray(invoiceLineItems.invoiceId, invoiceIds))
    : [];

  const customerMap = new Map(customerRows.map((row) => [row.id, row]));
  const lineItemsMap = new Map<string, any[]>();
  for (const row of lineItemRows) {
    const arr = lineItemsMap.get(row.invoiceId) ?? [];
    arr.push(row);
    lineItemsMap.set(row.invoiceId, arr);
  }

  return rows.map((invoice: any) => ({
    ...invoice,
    customer: customerMap.get(invoice.customerId) ?? null,
    lineItems: lineItemsMap.get(invoice.id) ?? [],
  }));
}

export const invoicesService = {
  async assignInvoiceNumber(orgId: string, tx: any) {
    const [org] = await tx.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
    if (!org) throw new Error("Organization not found");

    const nextNumber = (org.nextInvoiceNumber ?? 1) + 1;
    await tx.update(organizations).set({ nextInvoiceNumber: nextNumber, updatedAt: new Date() }).where(eq(organizations.id, orgId));

    const year = new Date().getFullYear();
    return `${org.invoicePrefix}-${year}-${String(nextNumber - 1).padStart(4, "0")}`;
  },

  async createInvoice(orgId: string, dto: CreateInvoiceInput) {
    const payload = createInvoiceSchema.parse(dto);

    return db.transaction(async (tx) => {
      const invoiceNumber = await invoicesService.assignInvoiceNumber(orgId, tx);
      let subtotal = new Decimal(0);
      let taxTotal = new Decimal(0);

      const lineItems = payload.lineItems.map((item: any) => {
        const computed = taxService.calculateLineItemTax(new Decimal(item.unitPrice), new Decimal(item.quantity), item.taxRate);
        subtotal = subtotal.plus(computed.netAmount);
        taxTotal = taxTotal.plus(computed.taxAmount);

        return {
          id: randomUUID(),
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: String(item.unitPrice),
          taxRate: String(item.taxRate),
          taxAmount: computed.taxAmount.toString(),
          total: computed.grossAmount.toString(),
          sku: item.sku ?? null,
        };
      });

      const [invoice] = await tx
        .insert(invoices)
        .values({
          id: randomUUID(),
          organizationId: orgId,
          customerId: payload.customerId,
          invoiceNumber,
          status: "DRAFT",
          currency: payload.currency,
          notes: payload.notes ?? null,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
          externalOrderId: payload.externalOrderId ?? null,
          source: payload.source ?? null,
          subtotal: subtotal.toString(),
          taxTotal: taxTotal.toString(),
          total: subtotal.plus(taxTotal).toString(),
        })
        .returning();

      if (lineItems.length > 0) {
        await tx.insert(invoiceLineItems).values(lineItems.map((item: any) => ({ ...item, invoiceId: invoice.id })));
      }

      const [customer] = await tx.select().from(customers).where(eq(customers.id, invoice.customerId)).limit(1);
      return { ...invoice, customer, lineItems };
    });
  },

  async listInvoices(orgId: string, filters: Record<string, string>) {
    const page = Number(filters.page ?? 1);
    const limit = Number(filters.limit ?? 20);

    const conditions = [eq(invoices.organizationId, orgId)];
    if (filters.status) conditions.push(eq(invoices.status, filters.status as any));
    if (filters.from) conditions.push(gte(invoices.issueDate, new Date(filters.from)));
    if (filters.to) conditions.push(lte(invoices.issueDate, new Date(filters.to)));

    const where = conditions.length === 1 ? conditions[0] : and(...conditions);

    const dataRows = await db
      .select()
      .from(invoices)
      .where(where)
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(where);

    const data = await hydrateInvoices(dataRows);
    const total = Number(countRow?.count ?? 0);

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(orgId: string, id: string) {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.organizationId, orgId)))
      .limit(1);

    if (!invoice) return null;
    const [customer] = await db.select().from(customers).where(eq(customers.id, invoice.customerId)).limit(1);
    const lineItems = await db.select().from(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, invoice.id));
    return { ...invoice, customer, lineItems };
  },

  async update(orgId: string, id: string, data: Record<string, unknown>) {
    const [invoice] = await db
      .update(invoices)
      .set({ ...(data as any), updatedAt: new Date() })
      .where(and(eq(invoices.id, id), eq(invoices.organizationId, orgId)))
      .returning();
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  },

  async remove(orgId: string, id: string) {
    const [deleted] = await db
      .delete(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.organizationId, orgId)))
      .returning();
    if (!deleted) throw new Error("Invoice not found");
    return { success: true };
  },

  async generatePdf(orgId: string, invoiceId: string) {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId)))
      .limit(1);
    if (!invoice) throw new Error("Invoice not found");

    const [customer] = await db.select().from(customers).where(eq(customers.id, invoice.customerId)).limit(1);
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, invoice.organizationId)).limit(1);
    const lineItems = await db.select().from(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, invoice.id));

    const pdf = await pdfService.generateInvoicePdf({ ...invoice, customer, organization, lineItems });
    const pdfUrl = await pdfService.uploadPdf(pdf, invoiceId);
    await db.update(invoices).set({ pdfUrl, updatedAt: new Date() }).where(eq(invoices.id, invoiceId));
    return pdfUrl;
  },

  async sendInvoice(orgId: string, invoiceId: string) {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId)))
      .limit(1);
    if (!invoice) throw new Error("Invoice not found");

    const [customer] = await db.select().from(customers).where(eq(customers.id, invoice.customerId)).limit(1);
    if (!customer?.email) throw new Error("Customer email missing");

    const pdfUrl = invoice.pdfUrl ?? (await invoicesService.generatePdf(orgId, invoiceId));
    await emailService.sendInvoiceEmail({ to: customer.email, invoiceNumber: invoice.invoiceNumber, pdfUrl });
    await db
      .update(invoices)
      .set({ status: "SENT", sentAt: new Date(), updatedAt: new Date() })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId)));
    return { success: true };
  },

  async markPaid(orgId: string, invoiceId: string, paidAt?: Date) {
    const [invoice] = await db
      .update(invoices)
      .set({ status: "PAID", paidAt: paidAt ?? new Date(), updatedAt: new Date() })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId)))
      .returning();
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  },

  async markOverdueInvoices() {
    await db
      .update(invoices)
      .set({ status: "OVERDUE", updatedAt: new Date() })
      .where(and(eq(invoices.status, "SENT"), lte(invoices.dueDate, new Date())));
  },
};
