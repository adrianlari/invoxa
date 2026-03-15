import type { NextFunction, RequestHandler, Response } from "express";
import type { AppRequest } from "../types/request-context.ts";

export const contextMiddleware: RequestHandler = (req, _res: Response, next: NextFunction) => {
  const request = req as AppRequest;
  request.ctx = {
    organizationId: (request.header("x-organization-id") ?? "").trim(),
    authToken: request.header("authorization")?.replace("Bearer ", "").trim() || undefined,
  };
  next();
};
