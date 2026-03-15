import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

const spec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Invoxa API",
      version: "0.1.0",
      description: "E-commerce invoicing SaaS API for Amazon Selling Partners",
    },
    servers: [{ url: "http://localhost:3001", description: "Local dev" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
      parameters: {
        orgId: {
          in: "header",
          name: "X-Organization-Id",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Organization context for multi-tenant isolation",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            name: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Session: {
          type: "object",
          properties: {
            id: { type: "string" },
            token: { type: "string" },
            expiresAt: { type: "string", format: "date-time" },
          },
        },
        Organization: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            slug: { type: "string" },
            legalName: { type: "string", nullable: true },
            vatId: { type: "string", nullable: true },
            taxNumber: { type: "string", nullable: true },
            address: { type: "object" },
            defaultCurrency: { type: "string" },
            invoicePrefix: { type: "string" },
            onboardingComplete: { type: "boolean" },
          },
        },
        Customer: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", nullable: true },
            company: { type: "string", nullable: true },
            vatId: { type: "string", nullable: true },
            address: { type: "object" },
            source: { type: "string", nullable: true },
            externalId: { type: "string", nullable: true },
          },
        },
        LineItem: {
          type: "object",
          properties: {
            id: { type: "string" },
            description: { type: "string" },
            quantity: { type: "string" },
            unitPrice: { type: "string" },
            taxRate: { type: "string" },
            taxAmount: { type: "string" },
            total: { type: "string" },
            sku: { type: "string", nullable: true },
          },
        },
        Invoice: {
          type: "object",
          properties: {
            id: { type: "string" },
            invoiceNumber: { type: "string" },
            status: { type: "string", enum: ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED", "REFUNDED"] },
            customerId: { type: "string" },
            customer: { $ref: "#/components/schemas/Customer" },
            lineItems: { type: "array", items: { $ref: "#/components/schemas/LineItem" } },
            currency: { type: "string" },
            subtotal: { type: "string" },
            taxTotal: { type: "string" },
            total: { type: "string" },
            issueDate: { type: "string", format: "date-time" },
            dueDate: { type: "string", format: "date-time", nullable: true },
            notes: { type: "string", nullable: true },
            pdfUrl: { type: "string", nullable: true },
            externalOrderId: { type: "string", nullable: true },
            source: { type: "string", nullable: true },
          },
        },
        Integration: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string", enum: ["AMAZON", "SHOPIFY", "TEMU"] },
            status: { type: "string", enum: ["PENDING", "ACTIVE", "ERROR", "DISCONNECTED"] },
            lastSyncAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        AmazonOrderPreview: {
          type: "object",
          properties: {
            externalOrderId: { type: "string" },
            orderDate: { type: "string" },
            status: { type: "string" },
            amount: { type: "string" },
            currency: { type: "string" },
            marketplaceId: { type: "string" },
          },
        },
      },
    },
    paths: {
      // ─── Auth (public) ───
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 8 },
                    name: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "User created with default organization" },
            "400": { description: "Validation error" },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Log in and get session token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Session token and org memberships",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" },
                      session: { $ref: "#/components/schemas/Session" },
                      defaultOrganizationId: { type: "string" },
                      organizations: { type: "array", items: { type: "object" } },
                    },
                  },
                },
              },
            },
            "400": { description: "Invalid credentials" },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Log out and invalidate session",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "Logged out" } },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current authenticated user",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Current user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
            "401": { description: "Not authenticated" },
          },
        },
      },

      // ─── Organizations ───
      "/organizations/current": {
        get: {
          tags: ["Organizations"],
          summary: "Get current organization",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          responses: {
            "200": {
              description: "Organization details",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Organization" } } },
            },
          },
        },
        put: {
          tags: ["Organizations"],
          summary: "Update current organization",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
          responses: { "200": { description: "Updated organization" } },
        },
      },
      "/organizations/current/logo": {
        post: {
          tags: ["Organizations"],
          summary: "Upload organization logo",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", properties: { logoUrl: { type: "string" } } } } },
          },
          responses: { "200": { description: "Logo updated" } },
        },
      },

      // ─── Customers ───
      "/customers": {
        get: {
          tags: ["Customers"],
          summary: "List all customers",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          responses: {
            "200": {
              description: "Array of customers",
              content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Customer" } } } },
            },
          },
        },
        post: {
          tags: ["Customers"],
          summary: "Create a customer",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    company: { type: "string" },
                    vatId: { type: "string" },
                    address: { type: "object" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Created customer" } },
        },
      },
      "/customers/{id}": {
        get: {
          tags: ["Customers"],
          summary: "Get customer by ID (with invoices)",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }, { in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Customer with invoices" } },
        },
        put: {
          tags: ["Customers"],
          summary: "Update customer",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }, { in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
          responses: { "200": { description: "Updated customer" } },
        },
      },

      // ─── Invoices ───
      "/invoices": {
        get: {
          tags: ["Invoices"],
          summary: "List invoices (paginated)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: "#/components/parameters/orgId" },
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
            { in: "query", name: "status", schema: { type: "string", enum: ["DRAFT", "SENT", "PAID", "OVERDUE"] } },
            { in: "query", name: "from", schema: { type: "string", format: "date" } },
            { in: "query", name: "to", schema: { type: "string", format: "date" } },
          ],
          responses: { "200": { description: "Paginated invoice list" } },
        },
        post: {
          tags: ["Invoices"],
          summary: "Create an invoice",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["customerId", "lineItems"],
                  properties: {
                    customerId: { type: "string" },
                    currency: { type: "string", default: "EUR" },
                    dueDate: { type: "string", format: "date" },
                    notes: { type: "string" },
                    externalOrderId: { type: "string" },
                    source: { type: "string" },
                    lineItems: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["description", "quantity", "unitPrice", "taxRate"],
                        properties: {
                          description: { type: "string" },
                          quantity: { type: "number" },
                          unitPrice: { type: "number" },
                          taxRate: { type: "number" },
                          sku: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Created invoice with line items" } },
        },
      },
      "/invoices/{id}": {
        get: {
          tags: ["Invoices"],
          summary: "Get invoice by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }, { in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description: "Invoice with customer and line items",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Invoice" } } },
            },
          },
        },
        put: {
          tags: ["Invoices"],
          summary: "Update invoice",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }, { in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
          responses: { "200": { description: "Updated invoice" } },
        },
        delete: {
          tags: ["Invoices"],
          summary: "Delete invoice",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }, { in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Deleted" } },
        },
      },
      "/invoices/{id}/pdf": {
        get: {
          tags: ["Invoices"],
          summary: "Generate invoice PDF",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }, { in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description: "PDF URL",
              content: { "application/json": { schema: { type: "object", properties: { url: { type: "string" } } } } },
            },
          },
        },
      },
      "/invoices/{id}/send": {
        post: {
          tags: ["Invoices"],
          summary: "Send invoice via email",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }, { in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Invoice sent" } },
        },
      },
      "/invoices/{id}/paid": {
        post: {
          tags: ["Invoices"],
          summary: "Mark invoice as paid",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }, { in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": { schema: { type: "object", properties: { paidAt: { type: "string", format: "date-time" } } } },
            },
          },
          responses: { "200": { description: "Invoice marked as paid" } },
        },
      },

      // ─── Integrations ───
      "/integrations": {
        get: {
          tags: ["Integrations"],
          summary: "List active integrations",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          responses: {
            "200": {
              description: "Array of integrations",
              content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Integration" } } } },
            },
          },
        },
      },
      "/integrations/amazon/connect": {
        get: {
          tags: ["Integrations - Amazon"],
          summary: "Get Amazon OAuth authorization URL",
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: "#/components/parameters/orgId" },
            { in: "query", name: "marketplace", schema: { type: "string", default: "DE" } },
          ],
          responses: {
            "200": {
              description: "Auth URL and state",
              content: {
                "application/json": { schema: { type: "object", properties: { authUrl: { type: "string" }, state: { type: "string" } } } },
              },
            },
          },
        },
        post: {
          tags: ["Integrations - Amazon"],
          summary: "Initiate Amazon OAuth connection",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          requestBody: {
            content: {
              "application/json": {
                schema: { type: "object", properties: { marketplace: { type: "string" }, returnTo: { type: "string" } } },
              },
            },
          },
          responses: { "200": { description: "Auth URL" } },
        },
      },
      "/integrations/amazon/callback": {
        get: {
          tags: ["Integrations - Amazon"],
          summary: "Amazon OAuth callback (public)",
          description: "Called by Amazon after seller grants consent. Exchanges code for tokens.",
          parameters: [
            { in: "query", name: "spapi_oauth_code", required: true, schema: { type: "string" } },
            { in: "query", name: "state", required: true, schema: { type: "string" } },
            { in: "query", name: "selling_partner_id", schema: { type: "string" } },
          ],
          responses: { "200": { description: "Integration created, sync started" } },
        },
      },
      "/integrations/amazon/appstore/login": {
        get: {
          tags: ["Integrations - Amazon"],
          summary: "Amazon Appstore login redirect (public)",
          description: "Entry point when installing from Amazon Appstore.",
          parameters: [
            { in: "query", name: "amazon_callback_uri", required: true, schema: { type: "string" } },
            { in: "query", name: "amazon_state", required: true, schema: { type: "string" } },
            { in: "query", name: "selling_partner_id", required: true, schema: { type: "string" } },
          ],
          responses: { "302": { description: "Redirects to login page" } },
        },
      },
      "/integrations/amazon/appstore/continue": {
        post: {
          tags: ["Integrations - Amazon"],
          summary: "Continue Appstore login after user authenticates",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", required: ["appstoreLoginToken"], properties: { appstoreLoginToken: { type: "string" } } },
              },
            },
          },
          responses: { "200": { description: "Redirect URL to Amazon consent" } },
        },
      },
      "/integrations/amazon/appstore/callback": {
        get: {
          tags: ["Integrations - Amazon"],
          summary: "Amazon Appstore OAuth callback (public)",
          parameters: [
            { in: "query", name: "spapi_oauth_code", schema: { type: "string" } },
            { in: "query", name: "state", schema: { type: "string" } },
          ],
          responses: { "200": { description: "Integration created" }, "400": { description: "OAuth error" } },
        },
      },
      "/integrations/amazon/install/claim": {
        post: {
          tags: ["Integrations - Amazon"],
          summary: "Claim an Appstore install token",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", properties: { installToken: { type: "string" } } } } },
          },
          responses: { "200": { description: "Install claimed, sync started" } },
        },
      },
      "/integrations/amazon/orders/preview": {
        get: {
          tags: ["Integrations - Amazon"],
          summary: "Preview recent Amazon orders",
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: "#/components/parameters/orgId" },
            { in: "query", name: "marketplaceId", schema: { type: "string", default: "A1PA6795UKMFR9" } },
            { in: "query", name: "createdAfter", schema: { type: "string", format: "date-time" } },
            { in: "query", name: "limit", schema: { type: "integer", default: 5 } },
          ],
          responses: {
            "200": {
              description: "Order previews",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      source: { type: "string" },
                      count: { type: "integer" },
                      orders: { type: "array", items: { $ref: "#/components/schemas/AmazonOrderPreview" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/integrations/amazon/orders/{orderId}/detail": {
        get: {
          tags: ["Integrations - Amazon"],
          summary: "Get Amazon order details",
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: "#/components/parameters/orgId" },
            { in: "path", name: "orderId", required: true, schema: { type: "string" } },
          ],
          responses: { "200": { description: "Order detail" } },
        },
      },
      "/integrations/amazon/orders/{orderId}/items": {
        get: {
          tags: ["Integrations - Amazon"],
          summary: "Get Amazon order line items",
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: "#/components/parameters/orgId" },
            { in: "path", name: "orderId", required: true, schema: { type: "string" } },
          ],
          responses: { "200": { description: "Order items" } },
        },
      },
      "/integrations/amazon/sync-status/{jobId}": {
        get: {
          tags: ["Integrations - Amazon"],
          summary: "Get sync job status",
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: "#/components/parameters/orgId" },
            { in: "path", name: "jobId", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "Sync progress",
              content: {
                "application/json": { schema: { type: "object", properties: { state: { type: "string" }, progress: { type: "object" } } } },
              },
            },
          },
        },
      },
      "/integrations/{id}": {
        delete: {
          tags: ["Integrations"],
          summary: "Disconnect an integration",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }, { in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Disconnected" } },
        },
      },
      "/integrations/{id}/sync": {
        post: {
          tags: ["Integrations"],
          summary: "Trigger a sync",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }, { in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Sync triggered" } },
        },
      },
      "/integrations/{id}/sync-status": {
        get: {
          tags: ["Integrations"],
          summary: "Get integration sync status",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }, { in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Sync status" } },
        },
      },
      "/integrations/temu/import": {
        post: {
          tags: ["Integrations - Temu"],
          summary: "Import Temu orders via CSV",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", properties: { csv: { type: "string" } } } } },
          },
          responses: { "200": { description: "Import result with preview" } },
        },
      },

      // ─── Onboarding ───
      "/onboarding/state": {
        get: {
          tags: ["Onboarding"],
          summary: "Get onboarding completion state",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          responses: { "200": { description: "Onboarding state" } },
        },
      },
      "/onboarding/step/{step}": {
        put: {
          tags: ["Onboarding"],
          summary: "Complete an onboarding step",
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: "#/components/parameters/orgId" },
            {
              in: "path",
              name: "step",
              required: true,
              schema: { type: "string", enum: ["company", "branding", "tax", "integration", "preview"] },
            },
          ],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
          responses: { "200": { description: "Step completed" } },
        },
      },
      "/onboarding/validate-vat": {
        post: {
          tags: ["Onboarding"],
          summary: "Validate a VAT ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", properties: { vatId: { type: "string" } } } } },
          },
          responses: { "200": { description: "Validation result" } },
        },
      },
      "/onboarding/complete": {
        post: {
          tags: ["Onboarding"],
          summary: "Mark onboarding as complete",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          responses: { "200": { description: "Onboarding completed" } },
        },
      },

      // ─── Exports ───
      "/exports/datev": {
        get: {
          tags: ["Exports"],
          summary: "Generate DATEV CSV export",
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: "#/components/parameters/orgId" },
            { in: "query", name: "from", required: true, schema: { type: "string", format: "date" }, description: "Start date" },
            { in: "query", name: "to", required: true, schema: { type: "string", format: "date" }, description: "End date" },
          ],
          responses: {
            "200": {
              description: "DATEV CSV content",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { filename: { type: "string" }, content: { type: "string" } } },
                },
              },
            },
          },
        },
      },
      "/exports/invoices/zip": {
        get: {
          tags: ["Exports"],
          summary: "Export invoices as ZIP (scaffolded)",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/orgId" }],
          responses: { "200": { description: "Placeholder" } },
        },
      },
    },
  },
  apis: [], // We define paths inline above, no JSDoc scanning needed
});

export function setupSwagger(app: Express) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
  app.get("/docs.json", (_req, res) => res.json(spec));
}
