import { Router } from "express";
import { integrationsService } from "../services/integrations.service.ts";

export const integrationsRoutes = Router();

// All routes here are protected by authGuard (mounted in app.ts)
// Public OAuth callbacks are in integrations-public.routes.ts

integrationsRoutes.get("/", async (req: any, res, next) => {
  try {
    res.json(await integrationsService.list(req.ctx.organizationId));
  } catch (err) {
    next(err);
  }
});

integrationsRoutes.get("/amazon/connect", async (req: any, res, next) => {
  try {
    res.json(
      await integrationsService.connectAmazon(req.ctx.organizationId, {
        marketplace: String(req.query.marketplace ?? "DE"),
        returnTo: req.query.returnTo ? String(req.query.returnTo) : undefined,
      }),
    );
  } catch (err) {
    next(err);
  }
});

integrationsRoutes.post("/amazon/connect", async (req: any, res, next) => {
  try {
    res.json(
      await integrationsService.connectAmazon(req.ctx.organizationId, {
        marketplace: req.body.marketplace ? String(req.body.marketplace) : "DE",
        returnTo: req.body.returnTo ? String(req.body.returnTo) : undefined,
      }),
    );
  } catch (err) {
    next(err);
  }
});

integrationsRoutes.post("/amazon/appstore/continue", async (req: any, res, next) => {
  try {
    res.json(
      await integrationsService.continueAppstoreLogin({
        appstoreLoginToken: String(req.body.appstoreLoginToken ?? ""),
        userId: (req as any).user.id,
        preferredOrganizationId: req.ctx.organizationId || undefined,
      }),
    );
  } catch (err) {
    next(err);
  }
});

integrationsRoutes.post("/amazon/install/claim", async (req: any, res, next) => {
  try {
    res.json(
      await integrationsService.claimAppstoreInstall(
        String(req.body.installToken ?? ""),
        (req as any).user.id,
        req.ctx.organizationId || undefined,
      ),
    );
  } catch (err) {
    next(err);
  }
});

integrationsRoutes.get("/amazon/sync-status/:jobId", async (req: any, res, next) => {
  try {
    res.json(await integrationsService.getSyncStatus(req.params.jobId));
  } catch (err) {
    next(err);
  }
});

integrationsRoutes.get("/amazon/orders/:orderId/detail", async (req: any, res, next) => {
  try {
    res.json(await integrationsService.getAmazonOrderDetail(req.ctx.organizationId, req.params.orderId));
  } catch (err) {
    next(err);
  }
});

integrationsRoutes.get("/amazon/orders/:orderId/items", async (req: any, res, next) => {
  try {
    const items = await integrationsService.getAmazonOrderItems(req.ctx.organizationId, req.params.orderId);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

integrationsRoutes.get("/amazon/orders/preview", async (req: any, res, next) => {
  try {
    res.json(
      await integrationsService.previewAmazonOrders(req.ctx.organizationId, {
        marketplaceId: String(req.query.marketplaceId ?? "A1PA6795UKMFR9"),
        createdAfter: req.query.createdAfter ? String(req.query.createdAfter) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : 5,
      }),
    );
  } catch (err) {
    next(err);
  }
});

integrationsRoutes.post("/shopify/connect", (_req, res) => {
  res.json({ message: "Shopify OAuth scaffolded." });
});

integrationsRoutes.get("/shopify/callback", (_req, res) => {
  res.json({ success: true });
});

integrationsRoutes.post("/temu/import", async (req: any, res, next) => {
  try {
    res.json(await integrationsService.importTemu(req.ctx.organizationId, req.body.csv ?? ""));
  } catch (err) {
    next(err);
  }
});

integrationsRoutes.delete("/:id", async (req: any, res, next) => {
  try {
    res.json(await integrationsService.disconnect(req.ctx.organizationId, req.params.id));
  } catch (err) {
    next(err);
  }
});

integrationsRoutes.post("/:id/sync", async (req: any, res, next) => {
  try {
    res.json(await integrationsService.triggerSync(req.ctx.organizationId, req.params.id));
  } catch (err) {
    next(err);
  }
});

integrationsRoutes.get("/:id/sync-status", async (req: any, res, next) => {
  try {
    res.json(await integrationsService.syncStatus(req.ctx.organizationId, req.params.id));
  } catch (err) {
    next(err);
  }
});
