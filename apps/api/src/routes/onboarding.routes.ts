import { Router } from "express";
import { onboardingService } from "../services/onboarding.service.ts";

export const onboardingRoutes = Router();

onboardingRoutes.get("/state", async (req: any, res, next) => {
  try {
    res.json(await onboardingService.getState(req.ctx.organizationId));
  } catch (err) {
    next(err);
  }
});

onboardingRoutes.put("/step/:step", async (req: any, res, next) => {
  try {
    res.json(await onboardingService.completeStep(req.ctx.organizationId, req.params.step, req.body));
  } catch (err) {
    next(err);
  }
});

onboardingRoutes.post("/validate-vat", async (req: any, res, next) => {
  try {
    res.json(await onboardingService.validateVatId(req.body.vatId));
  } catch (err) {
    next(err);
  }
});

onboardingRoutes.post("/complete", async (req: any, res, next) => {
  try {
    res.json(await onboardingService.complete(req.ctx.organizationId));
  } catch (err) {
    next(err);
  }
});
