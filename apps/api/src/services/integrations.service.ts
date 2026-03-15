import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { parse } from "csv-parse/sync";
import axios from "axios";
import { db } from "../db/client.ts";
import { encrypt, decrypt } from "../lib/crypto.ts";
import { createAmazonProvider } from "../integrations/amazon/provider-factory.ts";
import type { AmazonCredentials } from "../integrations/amazon/types.ts";
import { integrations } from "../db/schemas/integrations.ts";
import { orgMembers } from "../db/schemas/organization-members.ts";

const IntegrationType = {
  AMAZON: "AMAZON",
  SHOPIFY: "SHOPIFY",
  TEMU: "TEMU",
} as const;

const IntegrationStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  DISCONNECTED: "DISCONNECTED",
} as const;
const AMAZON_LAUNCH_MARKETPLACE = "DE" as const;

type SyncJobState = {
  jobId: string;
  state: "waiting" | "active" | "completed" | "failed";
  progress: { percent: number; ordersFound: number; invoicesCreated: number };
  integrationId?: string;
};

const oauthStateStore = new Map<string, { orgId: string; marketplace: string; returnTo?: string; expiresAt: number }>();
const syncJobs = new Map<string, SyncJobState>();
const appstoreLoginStore = new Map<
  string,
  {
    amazonCallbackUri: string;
    amazonState: string;
    sellingPartnerId: string;
    version?: string;
    marketplace: string;
    expiresAt: number;
  }
>();
const appstoreInstallStore = new Map<
  string,
  {
    state: string;
    code: string;
    sellerId?: string;
    marketplace: string;
    expiresAt: number;
  }
>();

function createMockSyncJob(integrationId?: string) {
  const jobId = randomUUID();
  const createdAt = Date.now();

  syncJobs.set(jobId, {
    jobId,
    integrationId,
    state: "active",
    progress: { percent: 0, ordersFound: 0, invoicesCreated: 0 },
  });

  const timer = setInterval(() => {
    const existing = syncJobs.get(jobId);
    if (!existing) {
      clearInterval(timer);
      return;
    }

    const elapsed = Date.now() - createdAt;
    const percent = Math.min(100, Math.round((elapsed / 7000) * 100));
    const ordersFound = 5;
    const invoicesCreated = Math.min(ordersFound, Math.round((percent / 100) * ordersFound));
    const state = percent >= 100 ? "completed" : "active";

    syncJobs.set(jobId, {
      ...existing,
      state,
      progress: { percent, ordersFound, invoicesCreated },
    });

    if (state === "completed") clearInterval(timer);
  }, 1000);

  return jobId;
}

async function exchangeAmazonOauthCode(code: string) {
  const clientId = process.env.AMAZON_CLIENT_ID;
  const clientSecret = process.env.AMAZON_CLIENT_SECRET;
  const redirectUri = process.env.AMAZON_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return {
      access_token: "mock-access-token",
      refresh_token: process.env.AMAZON_REFRESH_TOKEN ?? "mock-refresh-token",
      expires_in: 3600,
      token_type: "bearer",
    };
  }

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const { data } = await axios.post<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }>("https://api.amazon.com/auth/o2/token", params.toString(), {
    headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
  });

  if (!data.access_token || !data.refresh_token || !data.expires_in) {
    throw new Error("Amazon OAuth exchange returned an invalid token payload");
  }

  return data;
}

function normalizeAmazonMarketplace(input?: string) {
  const marketplace = (input ?? AMAZON_LAUNCH_MARKETPLACE).toUpperCase();
  if (marketplace !== AMAZON_LAUNCH_MARKETPLACE) {
    throw new Error(`Marketplace ${marketplace} is not enabled yet. Current launch supports DE only.`);
  }
  return marketplace;
}

function ensureHttpsAmazonCallbackUri(uri: string) {
  const parsed = new URL(uri);
  if (parsed.protocol !== "https:") throw new Error("Invalid amazon_callback_uri protocol");
  return parsed;
}

async function loadOrgAmazonCredentials(organizationId: string): Promise<AmazonCredentials | undefined> {
  const [integration] = await db
    .select()
    .from(integrations)
    .where(and(eq(integrations.organizationId, organizationId), eq(integrations.type, "AMAZON"), eq(integrations.status, "ACTIVE")))
    .limit(1);

  if (!integration) return undefined;

  const creds = integration.credentials as { token?: string } | null;
  if (!creds?.token) return undefined;

  try {
    const decrypted = decrypt<{
      refreshToken: string;
      accessToken?: string;
      sellerId?: string;
    }>(creds.token);

    return {
      clientId: process.env.AMAZON_CLIENT_ID ?? "",
      clientSecret: process.env.AMAZON_CLIENT_SECRET ?? "",
      refreshToken: decrypted.refreshToken,
      sellerId: decrypted.sellerId,
    };
  } catch {
    return undefined;
  }
}

export const integrationsService = {
  async list(organizationId: string) {
    try {
      return await db.select().from(integrations).where(eq(integrations.organizationId, organizationId));
    } catch {
      return [];
    }
  },

  async createOauthState(orgId: string, payload: { marketplace: string; returnTo?: string }) {
    const state = randomUUID();
    oauthStateStore.set(state, {
      orgId,
      marketplace: payload.marketplace,
      returnTo: payload.returnTo,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    return state;
  },

  async connectAmazon(organizationId: string, options?: { marketplace?: string; returnTo?: string }) {
    const marketplace = normalizeAmazonMarketplace(options?.marketplace);

    const state = await integrationsService.createOauthState(organizationId, {
      marketplace,
      returnTo: options?.returnTo,
    });

    const q = new URLSearchParams({
      application_id: process.env.AMAZON_APP_ID ?? "",
      redirect_uri: process.env.AMAZON_REDIRECT_URI ?? "",
      state,
      version: "beta",
    });

    return { authUrl: `https://sellercentral.amazon.de/apps/authorize/consent?${q.toString()}`, state };
  },

  async startAppstoreLogin(params: {
    amazonCallbackUri: string;
    amazonState: string;
    sellingPartnerId: string;
    version?: string;
    marketplace?: string;
  }) {
    const callbackUri = ensureHttpsAmazonCallbackUri(params.amazonCallbackUri);
    const marketplace = normalizeAmazonMarketplace(params.marketplace);
    const appstoreLoginToken = randomUUID();

    appstoreLoginStore.set(appstoreLoginToken, {
      amazonCallbackUri: callbackUri.toString(),
      amazonState: params.amazonState,
      sellingPartnerId: params.sellingPartnerId,
      version: params.version,
      marketplace,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    const webBase = process.env.WEB_URL ?? "http://localhost:3000";
    const loginUrl = new URL("/login", webBase);
    loginUrl.searchParams.set("appstoreLoginToken", appstoreLoginToken);
    loginUrl.searchParams.set("spid", params.sellingPartnerId);

    return { appstoreLoginToken, loginUrl: loginUrl.toString() };
  },

  async continueAppstoreLogin(params: { appstoreLoginToken: string; userId: string; preferredOrganizationId?: string }) {
    const pending = appstoreLoginStore.get(params.appstoreLoginToken);
    if (!pending || pending.expiresAt < Date.now()) {
      throw new Error("Amazon login session expired. Please restart from Amazon Appstore.");
    }

    const membershipFilter = params.preferredOrganizationId
      ? and(eq(orgMembers.userId, params.userId), eq(orgMembers.organizationId, params.preferredOrganizationId))
      : eq(orgMembers.userId, params.userId);

    const [membership] = await db.select({ organizationId: orgMembers.organizationId }).from(orgMembers).where(membershipFilter).limit(1);

    if (!membership?.organizationId) {
      throw new Error("No organization found for this user.");
    }

    const state = await integrationsService.createOauthState(membership.organizationId, {
      marketplace: pending.marketplace,
      returnTo: "/integrations/amazon/wizard",
    });

    const redirectUri = process.env.AMAZON_REDIRECT_URI;
    if (!redirectUri) throw new Error("AMAZON_REDIRECT_URI is missing");

    const callbackUrl = new URL(pending.amazonCallbackUri);
    callbackUrl.searchParams.set("amazon_state", pending.amazonState);
    callbackUrl.searchParams.set("state", state);
    callbackUrl.searchParams.set("redirect_uri", redirectUri);
    if (pending.version === "beta") callbackUrl.searchParams.set("version", "beta");

    appstoreLoginStore.delete(params.appstoreLoginToken);

    return { redirectUrl: callbackUrl.toString(), organizationId: membership.organizationId };
  },

  async previewAmazonOrders(organizationId: string, params: { marketplaceId: string; createdAfter?: string; limit?: number }) {
    const credentials = await loadOrgAmazonCredentials(organizationId);
    const provider = createAmazonProvider(credentials);
    const orders = await provider.fetchRecentOrders(params);
    return {
      source: credentials ? "amazon-sdk" : process.env.AMAZON_REFRESH_TOKEN ? "amazon-sdk" : "mock-provider",
      count: orders.length,
      orders,
    };
  },

  async getAmazonOrderDetail(organizationId: string, orderId: string) {
    const credentials = await loadOrgAmazonCredentials(organizationId);
    const provider = createAmazonProvider(credentials);
    return provider.fetchOrderDetail(orderId);
  },

  async getAmazonOrderItems(organizationId: string, orderId: string) {
    const credentials = await loadOrgAmazonCredentials(organizationId);
    const provider = createAmazonProvider(credentials);
    return provider.fetchOrderItems(orderId);
  },

  async amazonCallback(params: { state: string; code: string; sellerId?: string }) {
    const saved = oauthStateStore.get(params.state);
    if (!saved || saved.expiresAt < Date.now()) {
      throw new Error("Invalid or expired OAuth state");
    }

    const organizationId = saved.orgId;

    const result = await integrationsService.upsertAmazonIntegration(organizationId, {
      code: params.code,
      sellerId: params.sellerId,
      marketplace: saved.marketplace,
    });

    oauthStateStore.delete(params.state);

    const jobId = createMockSyncJob(result.integrationId);
    const redirectPath = `/integrations/amazon/wizard?step=syncing&jobId=${jobId}&integrationId=${result.integrationId}`;
    const webBase = process.env.WEB_URL ?? "http://localhost:3000";

    return { success: true, jobId, integrationId: result.integrationId, redirectPath, redirectUrl: `${webBase}${redirectPath}` };
  },

  async upsertAmazonIntegration(
    organizationId: string,
    params: { code: string; sellerId?: string; marketplace: string },
  ): Promise<{ integrationId: string }> {
    const [existing] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.organizationId, organizationId), eq(integrations.type, IntegrationType.AMAZON)))
      .limit(1);

    let integrationId = existing?.id;

    const tokens = await exchangeAmazonOauthCode(params.code);

    const credentials = {
      oauthCode: params.code,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenType: tokens.token_type,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      sellerId: params.sellerId,
    };

    if (existing) {
      await db
        .update(integrations)
        .set({
          status: IntegrationStatus.ACTIVE,
          credentials: { token: encrypt(credentials) },
          settings: { ...(existing.settings as Record<string, unknown> | null), marketplace: params.marketplace },
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, existing.id));
    } else {
      const [created] = await db
        .insert(integrations)
        .values({
          id: randomUUID(),
          organizationId,
          type: IntegrationType.AMAZON,
          status: IntegrationStatus.ACTIVE,
          credentials: { token: encrypt(credentials) },
          settings: { marketplace: params.marketplace },
        })
        .returning();
      integrationId = created.id;
    }

    return { integrationId: integrationId! };
  },

  async appstoreCallback(params: { code: string; state: string; sellerId?: string }) {
    if (!params.state || !params.code) {
      throw new Error("Missing OAuth callback parameters");
    }
    return integrationsService.amazonCallback({ state: params.state, code: params.code, sellerId: params.sellerId });
  },

  async claimAppstoreInstall(installToken: string, userId: string, preferredOrganizationId?: string) {
    const install = appstoreInstallStore.get(installToken);
    if (!install || install.expiresAt < Date.now()) {
      throw new Error("Install session expired. Restart Amazon Appstore connection.");
    }

    const membershipFilter = preferredOrganizationId
      ? and(eq(orgMembers.userId, userId), eq(orgMembers.organizationId, preferredOrganizationId))
      : eq(orgMembers.userId, userId);

    const [membership] = await db.select({ organizationId: orgMembers.organizationId }).from(orgMembers).where(membershipFilter).limit(1);

    if (!membership?.organizationId) {
      throw new Error("No organization found for this user. Complete registration first.");
    }

    const result = await integrationsService.upsertAmazonIntegration(membership.organizationId, {
      code: install.code,
      sellerId: install.sellerId,
      marketplace: install.marketplace,
    });

    appstoreInstallStore.delete(installToken);

    const jobId = createMockSyncJob(result.integrationId);
    const redirectPath = `/integrations/amazon/wizard?step=syncing&jobId=${jobId}&integrationId=${result.integrationId}`;
    const webBase = process.env.WEB_URL ?? "http://localhost:3000";

    return {
      success: true,
      organizationId: membership.organizationId,
      integrationId: result.integrationId,
      jobId,
      redirectPath,
      redirectUrl: `${webBase}${redirectPath}`,
    };
  },

  async getSyncStatus(jobId: string) {
    const job = syncJobs.get(jobId);
    if (!job) {
      return { state: "failed", progress: { percent: 0, ordersFound: 0, invoicesCreated: 0 } };
    }

    return {
      state: job.state,
      progress: job.progress,
      ordersFound: job.progress.ordersFound,
      invoicesCreated: job.progress.invoicesCreated,
    };
  },

  async importTemu(organizationId: string, csv: string) {
    const rows = parse(csv, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

    const [existing] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.organizationId, organizationId), eq(integrations.type, IntegrationType.TEMU)))
      .limit(1);

    if (existing) {
      await db
        .update(integrations)
        .set({ status: IntegrationStatus.ACTIVE, updatedAt: new Date() })
        .where(eq(integrations.id, existing.id));
    } else {
      await db.insert(integrations).values({
        id: randomUUID(),
        organizationId,
        type: IntegrationType.TEMU,
        status: IntegrationStatus.ACTIVE,
        credentials: { token: encrypt({ csv: true }) },
      });
    }

    return { count: rows.length, preview: rows.slice(0, 5) };
  },

  async disconnect(organizationId: string, id: string) {
    const rows = await db
      .update(integrations)
      .set({ status: IntegrationStatus.DISCONNECTED, updatedAt: new Date() })
      .where(and(eq(integrations.id, id), eq(integrations.organizationId, organizationId)))
      .returning();
    return { count: rows.length };
  },

  async triggerSync(organizationId: string, id: string) {
    const rows = await db
      .update(integrations)
      .set({ status: IntegrationStatus.ACTIVE, lastSyncAt: new Date(), updatedAt: new Date() })
      .where(and(eq(integrations.id, id), eq(integrations.organizationId, organizationId)))
      .returning();

    const jobId = createMockSyncJob(id);

    return { count: rows.length, jobId };
  },

  async syncStatus(organizationId: string, id: string) {
    const [row] = await db
      .select({ id: integrations.id, status: integrations.status, lastSyncAt: integrations.lastSyncAt })
      .from(integrations)
      .where(and(eq(integrations.id, id), eq(integrations.organizationId, organizationId)))
      .limit(1);
    return row ?? null;
  },
};
