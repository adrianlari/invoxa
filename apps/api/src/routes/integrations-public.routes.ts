import { Router } from "express";
import { integrationsService } from "../services/integrations.service.ts";

export const integrationsPublicRoutes = Router();

// These routes are called by Amazon's redirect — no auth token available
integrationsPublicRoutes.get("/amazon/callback", async (req: any, res, next) => {
  try {
    const result = await integrationsService.amazonCallback({
      state: String(req.query.state ?? ""),
      code: String(req.query.spapi_oauth_code ?? ""),
      sellerId: req.query.selling_partner_id ? String(req.query.selling_partner_id) : undefined,
    });

    if (req.query.redirect === "1") {
      return res.redirect(result.redirectUrl);
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

integrationsPublicRoutes.get("/amazon/appstore/login", async (req: any, res, next) => {
  try {
    const amazonCallbackUri = String(req.query.amazon_callback_uri ?? "");
    const amazonState = String(req.query.amazon_state ?? "");
    const sellingPartnerId = String(req.query.selling_partner_id ?? "");
    const version = req.query.version ? String(req.query.version) : undefined;
    const result = await integrationsService.startAppstoreLogin({
      amazonCallbackUri,
      amazonState,
      sellingPartnerId,
      version,
      marketplace: "DE",
    });

    if (req.query.redirect !== "0") {
      return res.redirect(result.loginUrl);
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

integrationsPublicRoutes.get("/amazon/appstore/callback", async (req: any, res, next) => {
  try {
    if (req.query.error) {
      const webBase = process.env.WEB_URL ?? "http://localhost:3000";
      const failure = new URL("/integrations", webBase);
      failure.searchParams.set("amazon", "error");
      failure.searchParams.set("reason", String(req.query.error));
      if (req.query.error_description) {
        failure.searchParams.set("message", String(req.query.error_description));
      }
      if (req.query.redirect !== "0") {
        return res.redirect(failure.toString());
      }
      return res.status(400).json({ error: String(req.query.error), errorDescription: req.query.error_description ?? null });
    }

    const result = await integrationsService.appstoreCallback({
      state: String(req.query.state ?? ""),
      code: String(req.query.spapi_oauth_code ?? ""),
      sellerId: req.query.selling_partner_id ? String(req.query.selling_partner_id) : undefined,
    });

    if (req.query.redirect !== "0") {
      return res.redirect(result.redirectUrl);
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});
