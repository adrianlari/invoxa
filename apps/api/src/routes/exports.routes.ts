import { Router } from "express";
import { datevService } from "../services/datev.service.ts";

export const exportsRoutes = Router();

exportsRoutes.get("/datev", async (req: any, res, next) => {
  try {
    const from = new Date(String(req.query.from));
    const to = new Date(String(req.query.to));
    const csv = await datevService.generateExport(req.ctx.organizationId, from, to);
    res.json({ filename: "datev-export.csv", content: csv.toString("utf8") });
  } catch (err) {
    next(err);
  }
});

exportsRoutes.get("/invoices/zip", (_req, res) => {
  res.json({ message: "ZIP export scaffolded. Implement stream archive for production." });
});
