import type { NextFunction, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db, withRlsContext } from "../db/client.ts";
import type { AppRequest } from "../types/request-context.ts";
import { orgMembers } from "../db/schemas/organization-members.ts";
import { sessions } from "../db/schemas/sessions.ts";
import { users } from "../db/schemas/users.ts";

export async function authGuard(req: any, res: Response, next: NextFunction) {
  const request = req as AppRequest;
  const token = request.ctx?.authToken;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Auth queries use the shared db (no RLS needed for sessions/users)
  const [sessionWithUser] = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.token, token))
    .limit(1);

  if (!sessionWithUser || sessionWithUser.session.expiresAt < new Date()) {
    return res.status(401).json({ error: "Session expired" });
  }

  const organizationId = request.ctx.organizationId;
  if (!organizationId) {
    return res.status(400).json({ error: "X-Organization-Id header is required" });
  }

  const [membership] = await db
    .select({ role: orgMembers.role })
    .from(orgMembers)
    .where(and(eq(orgMembers.userId, sessionWithUser.user.id), eq(orgMembers.organizationId, organizationId)))
    .limit(1);

  if (!membership) {
    return res.status(403).json({ error: "Access denied to this organization" });
  }

  (request as any).user = sessionWithUser.user;
  (request as any).membership = membership;

  // Wrap the rest of the request in an RLS-scoped connection.
  // All downstream calls to getDb() will use this scoped connection.
  withRlsContext(organizationId, () => {
    return new Promise<void>((resolve, reject) => {
      res.on("finish", resolve);
      res.on("error", reject);
      next();
    });
  }).catch(next);
}
