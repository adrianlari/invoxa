import { Router } from "express";
import { authService } from "../services/auth.service.ts";

export const authRoutes = Router();

authRoutes.post("/register", async (req: any, res, next) => {
  try {
    res.json(await authService.register(req.body.email, req.body.password, req.body.name));
  } catch (err) {
    next(err);
  }
});

authRoutes.post("/login", async (req: any, res, next) => {
  try {
    res.json(await authService.login(req.body.email, req.body.password));
  } catch (err) {
    next(err);
  }
});

authRoutes.post("/logout", async (req: any, res, next) => {
  try {
    res.json(await authService.logout(req.ctx?.authToken));
  } catch (err) {
    next(err);
  }
});

authRoutes.get("/me", async (req: any, res, next) => {
  try {
    res.json(await authService.me(req.ctx?.authToken));
  } catch (err) {
    next(err);
  }
});
