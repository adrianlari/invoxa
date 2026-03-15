import type { Request } from "express";

export type RequestContext = {
  organizationId: string;
  authToken?: string;
};

export type AppRequest = Request & { ctx: RequestContext };
