import { z } from "zod";

export const invoiceLineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.string(),
  taxRate: z.number().min(0).max(100),
  sku: z.string().optional(),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().min(1),
  currency: z.string().default("EUR"),
  notes: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  externalOrderId: z.string().optional(),
  source: z.string().optional(),
  lineItems: z.array(invoiceLineItemSchema).min(1),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
