import { Router } from "express";
import { invoicesService } from "../services/invoices.service.ts";

export const invoicesRoutes = Router();

invoicesRoutes.get("/", async (req: any, res, next) => {
  try {
    res.json(await invoicesService.listInvoices(req.ctx.organizationId, req.query as Record<string, string>));
  } catch (err) {
    next(err);
  }
});

invoicesRoutes.post("/", async (req: any, res, next) => {
  try {
    res.json(await invoicesService.createInvoice(req.ctx.organizationId, req.body));
  } catch (err) {
    next(err);
  }
});

invoicesRoutes.get("/:id", async (req: any, res, next) => {
  try {
    res.json(await invoicesService.getById(req.ctx.organizationId, req.params.id));
  } catch (err) {
    next(err);
  }
});

invoicesRoutes.put("/:id", async (req: any, res, next) => {
  try {
    res.json(await invoicesService.update(req.ctx.organizationId, req.params.id, req.body));
  } catch (err) {
    next(err);
  }
});

invoicesRoutes.delete("/:id", async (req: any, res, next) => {
  try {
    res.json(await invoicesService.remove(req.ctx.organizationId, req.params.id));
  } catch (err) {
    next(err);
  }
});

invoicesRoutes.get("/:id/pdf", async (req: any, res, next) => {
  try {
    res.json({ url: await invoicesService.generatePdf(req.ctx.organizationId, req.params.id) });
  } catch (err) {
    next(err);
  }
});

invoicesRoutes.post("/:id/send", async (req: any, res, next) => {
  try {
    res.json(await invoicesService.sendInvoice(req.ctx.organizationId, req.params.id));
  } catch (err) {
    next(err);
  }
});

invoicesRoutes.post("/:id/paid", async (req: any, res, next) => {
  try {
    res.json(await invoicesService.markPaid(req.ctx.organizationId, req.params.id, req.body.paidAt ? new Date(req.body.paidAt) : undefined));
  } catch (err) {
    next(err);
  }
});

invoicesRoutes.post("/bulk-generate", (_req, res) => {
  res.json({ queued: true });
});
