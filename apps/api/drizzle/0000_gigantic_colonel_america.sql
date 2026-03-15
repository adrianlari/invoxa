CREATE TYPE "public"."IntegrationStatus" AS ENUM('PENDING', 'ACTIVE', 'ERROR', 'DISCONNECTED');--> statement-breakpoint
CREATE TYPE "public"."IntegrationType" AS ENUM('AMAZON', 'SHOPIFY', 'TEMU', 'WOOCOMMERCE', 'ETSY', 'EBAY');--> statement-breakpoint
CREATE TYPE "public"."OrgRole" AS ENUM('OWNER', 'ADMIN', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."InvoiceStatus" AS ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');--> statement-breakpoint
CREATE TABLE "Customer" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"externalId" text,
	"source" text,
	"email" text,
	"name" text NOT NULL,
	"company" text,
	"vatId" text,
	"address" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Integration" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"type" "IntegrationType" NOT NULL,
	"status" "IntegrationStatus" DEFAULT 'PENDING' NOT NULL,
	"credentials" jsonb NOT NULL,
	"settings" jsonb,
	"lastSyncAt" timestamp with time zone,
	"syncCursor" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "InvoiceLineItem" (
	"id" text PRIMARY KEY NOT NULL,
	"invoiceId" text NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 3) NOT NULL,
	"unitPrice" numeric(10, 4) NOT NULL,
	"taxRate" numeric(5, 2) NOT NULL,
	"taxAmount" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"sku" text
);
--> statement-breakpoint
CREATE TABLE "Invoice" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"customerId" text NOT NULL,
	"invoiceNumber" text NOT NULL,
	"status" "InvoiceStatus" DEFAULT 'DRAFT' NOT NULL,
	"issueDate" timestamp with time zone DEFAULT now() NOT NULL,
	"dueDate" timestamp with time zone,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"taxTotal" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"notes" text,
	"pdfUrl" text,
	"sentAt" timestamp with time zone,
	"paidAt" timestamp with time zone,
	"externalOrderId" text,
	"source" text,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "OrgMember" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"userId" text NOT NULL,
	"role" "OrgRole" DEFAULT 'MEMBER' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logoUrl" text,
	"legalName" text,
	"vatId" text,
	"taxNumber" text,
	"address" jsonb NOT NULL,
	"defaultCurrency" text DEFAULT 'EUR' NOT NULL,
	"invoicePrefix" text DEFAULT 'INV' NOT NULL,
	"nextInvoiceNumber" integer DEFAULT 1 NOT NULL,
	"defaultPaymentTermsDays" integer DEFAULT 14 NOT NULL,
	"onboardingComplete" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "Product" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"name" text NOT NULL,
	"sku" text,
	"defaultPrice" numeric(10, 4) NOT NULL,
	"taxRateId" text
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	CONSTRAINT "Session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "TaxRate" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"name" text NOT NULL,
	"rate" numeric(5, 2) NOT NULL,
	"country" text NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"passwordHash" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_organizationId_Organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_organizationId_Organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_invoiceId_Invoice_id_fk" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organizationId_Organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_Customer_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_organizationId_Organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Product" ADD CONSTRAINT "Product_organizationId_Organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Product" ADD CONSTRAINT "Product_taxRateId_TaxRate_id_fk" FOREIGN KEY ("taxRateId") REFERENCES "public"."TaxRate"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_organizationId_Organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "Customer_organizationId_externalId_source_key" ON "Customer" USING btree ("organizationId","externalId","source");--> statement-breakpoint
CREATE UNIQUE INDEX "Integration_organizationId_type_key" ON "Integration" USING btree ("organizationId","type");--> statement-breakpoint
CREATE UNIQUE INDEX "Invoice_organizationId_invoiceNumber_key" ON "Invoice" USING btree ("organizationId","invoiceNumber");--> statement-breakpoint
CREATE UNIQUE INDEX "OrgMember_organizationId_userId_key" ON "OrgMember" USING btree ("organizationId","userId");

-- Row-Level Security policies for multi-tenant isolation
-- These act as a safety net: even if app code misses an org filter,
-- the database will block cross-tenant access.

-- The app sets this session variable on each request:
--   SET LOCAL app.current_org_id = '<organizationId>';

-- ============================================================
-- Enable RLS on all org-scoped tables
-- ============================================================
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceLineItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Integration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TaxRate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Policies: allow access only when organizationId matches session var
-- ============================================================

-- Customer
CREATE POLICY customer_org_isolation ON "Customer"
  USING ("organizationId" = current_setting('app.current_org_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_org_id', true));

-- Invoice
CREATE POLICY invoice_org_isolation ON "Invoice"
  USING ("organizationId" = current_setting('app.current_org_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_org_id', true));

-- InvoiceLineItem (joined through Invoice)
CREATE POLICY invoice_line_item_org_isolation ON "InvoiceLineItem"
  USING (
    "invoiceId" IN (
      SELECT id FROM "Invoice"
      WHERE "organizationId" = current_setting('app.current_org_id', true)
    )
  )
  WITH CHECK (
    "invoiceId" IN (
      SELECT id FROM "Invoice"
      WHERE "organizationId" = current_setting('app.current_org_id', true)
    )
  );

-- Integration
CREATE POLICY integration_org_isolation ON "Integration"
  USING ("organizationId" = current_setting('app.current_org_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_org_id', true));

-- TaxRate
CREATE POLICY tax_rate_org_isolation ON "TaxRate"
  USING ("organizationId" = current_setting('app.current_org_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_org_id', true));

-- Product
CREATE POLICY product_org_isolation ON "Product"
  USING ("organizationId" = current_setting('app.current_org_id', true))
  WITH CHECK ("organizationId" = current_setting('app.current_org_id', true));

-- ============================================================
-- Note: RLS policies only apply to non-superuser roles.
-- Your app's database user must NOT be a superuser.
-- Create a dedicated role:
--   CREATE ROLE invoxa_app LOGIN PASSWORD 'xxx';
--   GRANT ALL ON ALL TABLES IN SCHEMA public TO invoxa_app;
-- ============================================================
