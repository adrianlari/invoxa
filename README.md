# Invoxa

Monorepo scaffold for an e-commerce invoicing SaaS.

## Stack

- Backend: Express + Drizzle + PostgreSQL + Puppeteer
- Frontend: Next.js App Router + Tailwind + React Query
- Shared contracts: `packages/shared`

## Structure

- `apps/api`: REST API, core modules (auth, org, invoices, tax, onboarding, integrations, DATEV)
- `apps/web`: Dashboard/auth pages and integration/onboarding flows
- `packages/shared`: shared Zod schemas and TS types

## Local Setup

1. Start infra:
   - `docker compose up -d`
2. Install deps:
   - `pnpm install`
3. Configure env:
   - Copy `apps/api/.env.example` to `apps/api/.env`
4. Generate/push Drizzle schema:
   - `pnpm --filter @invoxa/api drizzle:generate`
   - `pnpm --filter @invoxa/api drizzle:push`
5. Run apps:
   - `pnpm dev`

## Production Env (invoxa.com)

Use these values as baseline for production:

- API:
  - `API_URL=https://api.invoxa.com`
  - `WEB_URL=https://invoxa.com`
  - `AMAZON_REDIRECT_URI=https://api.invoxa.com/integrations/amazon/appstore/callback`
- Web:
  - `NEXT_PUBLIC_API_URL=https://api.invoxa.com`
  - `NEXT_PUBLIC_USE_MOCK_DATA=false`

Security baseline:

- Generate strong secrets:
  - `openssl rand -hex 32` for `SESSION_SECRET`
  - `openssl rand -hex 32` for `ENCRYPTION_KEY`
- Never commit `.env` files.
- Keep CORS restricted to your web origin (`https://invoxa.com`).

## Amazon Appstore (DE Launch)

- Launch is Germany-only (`DE`) in backend validation.
- Register these URLs in Seller Partner Appstore:
  - Login URI: `https://api.invoxa.com/integrations/amazon/appstore/login`
  - OAuth Redirect URI: `https://api.invoxa.com/integrations/amazon/appstore/callback`
- Appstore flow:
  1. Seller installs from Amazon Appstore.
  2. Amazon calls Login URI with `amazon_callback_uri`, `amazon_state`, `selling_partner_id`.
  3. User logs in on Invoxa, then app resumes Amazon auth.
  4. Amazon redirects to OAuth Redirect URI with `spapi_oauth_code`.
  5. Invoxa exchanges code for LWA tokens, stores integration, starts sync wizard.

## Notes

- This implementation is a production-ready scaffold with full route/module structure and core service logic.
- External integrations (Amazon SP-API token exchange, Shopify OAuth/webhooks, email provider wiring, object storage upload) are scaffolded with placeholders and should be finalized with live credentials.
- Frontend can run fully with scenario-based mock data (`NEXT_PUBLIC_USE_MOCK_DATA=true`, `NEXT_PUBLIC_MOCK_SCENARIO=default|high-volume|onboarding-incomplete|integration-errors`).
- Backend includes Amazon preview provider abstraction at `GET /integrations/amazon/orders/preview`; it uses `amazon-sp-api` when Amazon env credentials are present, otherwise falls back to a mock provider.
