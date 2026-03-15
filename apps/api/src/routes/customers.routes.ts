import { Router } from "express";
import { customersService } from "../services/customers.service.ts";

export const customersRoutes = Router();

customersRoutes.get("/", async (req: any, res, next) => {
  try {
    res.json(await customersService.list(req.ctx.organizationId));
  } catch (err) {
    next(err);
  }
});

customersRoutes.post("/", async (req: any, res, next) => {
  try {
    res.json(await customersService.create(req.ctx.organizationId, req.body));
  } catch (err) {
    next(err);
  }
});

customersRoutes.get("/:id", async (req: any, res, next) => {
  try {
    res.json(await customersService.getById(req.ctx.organizationId, req.params.id));
  } catch (err) {
    next(err);
  }
});

customersRoutes.put("/:id", async (req: any, res, next) => {
  try {
    res.json(await customersService.update(req.ctx.organizationId, req.params.id, req.body));
  } catch (err) {
    next(err);
  }
});
