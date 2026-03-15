import crypto, { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.ts";
import { orgMembers } from "../db/schemas/organization-members.ts";
import { organizations } from "../db/schemas/organizations.ts";
import { sessions } from "../db/schemas/sessions.ts";
import { users } from "../db/schemas/users.ts";

const BCRYPT_ROUNDS = 12;
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export const authService = {
  async register(email: string, password: string, name?: string) {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const userId = randomUUID();
    const organizationId = randomUUID();
    const orgName = (name?.trim() || email.split("@")[0] || "My Organization").slice(0, 60);
    const orgSlugBase =
      orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "org";
    const orgSlug = `${orgSlugBase}-${Date.now().toString(36)}`;

    const [user] = await db.insert(users).values({ id: userId, email, name, passwordHash }).returning();
    await db.insert(organizations).values({
      id: organizationId,
      name: orgName,
      slug: orgSlug,
      legalName: orgName,
      address: { street: "", city: "", zip: "", country: "DE" },
    });
    await db.insert(orgMembers).values({ id: randomUUID(), organizationId, userId, role: "OWNER" });

    return { user, defaultOrganizationId: organizationId };
  },

  async login(email: string, password: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !user.passwordHash) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const token = crypto.randomBytes(32).toString("hex");
    const [session] = await db
      .insert(sessions)
      .values({ id: randomUUID(), userId: user.id, token, expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS) })
      .returning();

    const memberships = await db
      .select({
        organizationId: orgMembers.organizationId,
        role: orgMembers.role,
        organizationName: organizations.name,
      })
      .from(orgMembers)
      .innerJoin(organizations, eq(organizations.id, orgMembers.organizationId))
      .where(eq(orgMembers.userId, user.id));

    return {
      user,
      session,
      defaultOrganizationId: memberships[0]?.organizationId ?? "",
      organizations: memberships,
    };
  },

  async me(token?: string) {
    if (!token) throw new Error("Missing token");

    const [sessionWithUser] = await db
      .select({ session: sessions, user: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.token, token)))
      .limit(1);

    if (!sessionWithUser || sessionWithUser.session.expiresAt < new Date()) throw new Error("Session expired");
    return sessionWithUser.user;
  },

  async logout(token?: string) {
    if (!token) return { success: true };

    await db.delete(sessions).where(eq(sessions.token, token));
    return { success: true };
  },
};
