import cors from "cors";
import express from "express";
import { contextMiddleware } from "./middleware/context.ts";
import { authGuard } from "./middleware/auth-guard.ts";
import { authRoutes } from "./routes/auth.routes.ts";
import { onboardingRoutes } from "./routes/onboarding.routes.ts";
import { organizationsRoutes } from "./routes/organizations.routes.ts";
import { invoicesRoutes } from "./routes/invoices.routes.ts";
import { customersRoutes } from "./routes/customers.routes.ts";
import { integrationsRoutes } from "./routes/integrations.routes.ts";
import { integrationsPublicRoutes } from "./routes/integrations-public.routes.ts";
import { exportsRoutes } from "./routes/exports.routes.ts";
import { setupSwagger } from "./swagger.ts";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.WEB_URL ?? "http://localhost:3000", credentials: true }));
  app.use((_req, res, next) => {
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  });
  app.use(express.json({ limit: "5mb" }));
  app.use(contextMiddleware);

  // Swagger docs (no auth required)
  setupSwagger(app);

  // Public routes (no auth required)
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/auth", authRoutes);
  app.use("/integrations", integrationsPublicRoutes);

  // Protected routes (auth + org membership verified)
  app.use("/onboarding", authGuard, onboardingRoutes);
  app.use("/organizations", authGuard, organizationsRoutes);
  app.use("/invoices", authGuard, invoicesRoutes);
  app.use("/customers", authGuard, customersRoutes);
  app.use("/integrations", authGuard, integrationsRoutes);
  app.use("/exports", authGuard, exportsRoutes);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : "Unexpected error";
    res.status(400).json({ error: message });
  });

  return app;
}
