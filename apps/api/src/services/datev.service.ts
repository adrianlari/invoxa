import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "../db/client.ts";
import { customers } from "../db/schemas/customers.ts";
import { invoices, invoiceLineItems } from "../db/schemas/invoices.ts";

function counterAccount(rate: number) {
  if (rate >= 19) return "8400";
  if (rate >= 7) return "8300";
  return "8125";
}

export const datevService = {
  async generateExport(orgId: string, from: Date, to: Date) {
    const invoiceRows = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.organizationId, orgId),
          gte(invoices.issueDate, from),
          lte(invoices.issueDate, to),
          inArray(invoices.status, ["SENT", "PAID", "OVERDUE"]),
        ),
      );

    const invoiceIds = invoiceRows.map((row) => row.id);
    const customerIds = [...new Set(invoiceRows.map((row) => row.customerId))];

    const customerRows = customerIds.length ? await db.select().from(customers).where(inArray(customers.id, customerIds)) : [];
    const lineItemRows = invoiceIds.length
      ? await db.select().from(invoiceLineItems).where(inArray(invoiceLineItems.invoiceId, invoiceIds))
      : [];

    const customerMap = new Map(customerRows.map((row) => [row.id, row]));
    const lineMap = new Map<string, any[]>();
    for (const row of lineItemRows) {
      const arr = lineMap.get(row.invoiceId) ?? [];
      arr.push(row);
      lineMap.set(row.invoiceId, arr);
    }

    const header = '"EXTF";700;21;"Buchungsstapel";4;20240101120000000;;"RE";"";"";"";1000;20240101;4;"";"";"";"";"";;""';

    const rows = invoiceRows.map((i) => {
      const date = `${String(i.issueDate.getDate()).padStart(2, "0")}${String(i.issueDate.getMonth() + 1).padStart(2, "0")}`;
      const taxRate = Number(lineMap.get(i.id)?.[0]?.taxRate ?? 0);
      const customer = customerMap.get(i.customerId);
      return [
        String(i.total),
        "S",
        i.currency,
        "1",
        "",
        "",
        "10000",
        counterAccount(taxRate),
        "",
        date,
        i.invoiceNumber,
        customer?.name ?? "Unknown",
      ].join(";");
    });

    return Buffer.from([header, ...rows].join("\n"));
  },
};
