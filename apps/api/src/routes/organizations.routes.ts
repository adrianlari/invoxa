import { Router } from "express";
import { organizationsService } from "../services/organizations.service.ts";

export const organizationsRoutes = Router();

organizationsRoutes.get("/current", async (req: any, res, next) => {
  try {
    res.json(await organizationsService.getCurrent(req.ctx.organizationId));
  } catch (err) {
    next(err);
  }
});

organizationsRoutes.put("/current", async (req: any, res, next) => {
  try {
    res.json(await organizationsService.updateCurrent(req.ctx.organizationId, req.body));
  } catch (err) {
    next(err);
  }
});

organizationsRoutes.post("/current/logo", async (req: any, res, next) => {
  try {
    res.json(await organizationsService.uploadLogo(req.ctx.organizationId, req.body.logoUrl));
  } catch (err) {
    next(err);
  }
});
