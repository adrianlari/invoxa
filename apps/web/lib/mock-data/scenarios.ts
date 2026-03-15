export type MockInvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

export type MockLineItem = {
  description: string;
  quantity: number;
  unitPrice: string;
  taxRate: number;
  total: string;
  sku?: string;
};

export type MockInvoice = {
  id: string;
  organizationId: string;
  customerId: string;
  invoiceNumber: string;
  status: MockInvoiceStatus;
  issueDate: string;
  dueDate?: string;
  currency: string;
  subtotal: string;
  taxTotal: string;
  total: string;
  notes?: string;
  pdfUrl?: string;
  source?: 'amazon' | 'shopify' | 'temu' | 'manual';
  externalOrderId?: string;
  lineItems: MockLineItem[];
};

export type MockCustomer = {
  id: string;
  organizationId: string;
  name: string;
  email?: string;
  company?: string;
  vatId?: string;
  source?: string;
};

export type MockIntegration = {
  id: string;
  organizationId: string;
  type: 'AMAZON' | 'SHOPIFY' | 'TEMU' | 'WOOCOMMERCE' | 'ETSY' | 'EBAY';
  status: 'PENDING' | 'ACTIVE' | 'ERROR' | 'DISCONNECTED';
  lastSyncAt: string | null;
  syncCursor?: string | null;
  errorMessage?: string;
};

export type MockScenarioData = {
  organization: {
    id: string;
    name: string;
    slug: string;
    invoicePrefix: string;
    legalName: string;
    onboardingComplete: boolean;
    vatId?: string;
    defaultCurrency: string;
  };
  users: Array<{ id: string; email: string; name: string; password: string }>;
  sessions: Array<{ token: string; userId: string }>;
  customers: MockCustomer[];
  invoices: MockInvoice[];
  integrations: MockIntegration[];
  onboarding: {
    state: { company: boolean; branding: boolean; tax: boolean; integrations: boolean; preview: boolean };
  };
  amazon: {
    pendingOrders: Array<{
      externalOrderId: string;
      orderDate: string;
      currency: string;
      buyerName: string;
      amount: string;
      marketplaceId: string;
    }>;
  };
};

const baseCustomers: MockCustomer[] = [
  { id: 'cus_1', organizationId: 'org_demo', name: 'Muller Handels GmbH', email: 'ap@muller.de', company: 'Muller Handels GmbH', vatId: 'DE123456789', source: 'amazon' },
  { id: 'cus_2', organizationId: 'org_demo', name: 'Anna Schmidt', email: 'anna@example.com', source: 'manual' },
  { id: 'cus_3', organizationId: 'org_demo', name: 'Nordic Store AB', email: 'finance@nordicstore.se', company: 'Nordic Store AB', source: 'shopify' }
];

const baseInvoices: MockInvoice[] = [
  {
    id: 'inv_1',
    organizationId: 'org_demo',
    customerId: 'cus_1',
    invoiceNumber: 'INV-2026-0001',
    status: 'OVERDUE',
    issueDate: '2026-01-10T10:00:00.000Z',
    dueDate: '2026-01-24T10:00:00.000Z',
    currency: 'EUR',
    subtotal: '100.00',
    taxTotal: '19.00',
    total: '119.00',
    pdfUrl: 'https://example.com/mock/inv_1.pdf',
    source: 'amazon',
    externalOrderId: '405-1234567-1234567',
    lineItems: [{ description: 'Bluetooth Speaker', quantity: 1, unitPrice: '100.00', taxRate: 19, total: '119.00', sku: 'SPK-100-BLK' }]
  },
  {
    id: 'inv_2',
    organizationId: 'org_demo',
    customerId: 'cus_2',
    invoiceNumber: 'INV-2026-0002',
    status: 'PAID',
    issueDate: '2026-02-07T10:00:00.000Z',
    dueDate: '2026-02-21T10:00:00.000Z',
    currency: 'EUR',
    subtotal: '250.00',
    taxTotal: '47.50',
    total: '297.50',
    pdfUrl: 'https://example.com/mock/inv_2.pdf',
    source: 'shopify',
    externalOrderId: '#1002',
    lineItems: [{ description: 'Ergonomic Desk Lamp', quantity: 2, unitPrice: '125.00', taxRate: 19, total: '297.50', sku: 'LMP-220-WHT' }]
  },
  {
    id: 'inv_3',
    organizationId: 'org_demo',
    customerId: 'cus_3',
    invoiceNumber: 'INV-2026-0003',
    status: 'SENT',
    issueDate: '2026-02-15T08:15:00.000Z',
    dueDate: '2026-03-01T08:15:00.000Z',
    currency: 'EUR',
    subtotal: '80.00',
    taxTotal: '15.20',
    total: '95.20',
    source: 'manual',
    lineItems: [{ description: 'Support retainer (Feb)', quantity: 1, unitPrice: '80.00', taxRate: 19, total: '95.20' }]
  }
];

export const SCENARIOS: Record<string, MockScenarioData> = {
  default: {
    organization: { id: 'org_demo', name: 'Invoxa Demo GmbH', slug: 'invoxa-demo', invoicePrefix: 'INV', legalName: 'Invoxa Demo GmbH', onboardingComplete: true, vatId: 'DE123456789', defaultCurrency: 'EUR' },
    users: [{ id: 'usr_demo', email: 'demo@invoxa.app', name: 'Demo User', password: 'demo123' }],
    sessions: [],
    customers: baseCustomers,
    invoices: baseInvoices,
    integrations: [
      { id: 'int_1', organizationId: 'org_demo', type: 'AMAZON', status: 'ACTIVE', lastSyncAt: new Date(Date.now() - 15 * 60_000).toISOString(), syncCursor: '2026-02-18T12:00:00Z' },
      { id: 'int_2', organizationId: 'org_demo', type: 'SHOPIFY', status: 'ACTIVE', lastSyncAt: new Date(Date.now() - 8 * 60_000).toISOString(), syncCursor: '2026-02-18T12:08:00Z' },
      { id: 'int_3', organizationId: 'org_demo', type: 'TEMU', status: 'PENDING', lastSyncAt: null }
    ],
    onboarding: { state: { company: true, branding: true, tax: true, integrations: true, preview: true } },
    amazon: { pendingOrders: [
      { externalOrderId: '405-7777777-1111111', orderDate: '2026-02-18T10:05:00.000Z', currency: 'EUR', buyerName: 'Max Mustermann', amount: '59.90', marketplaceId: 'A1PA6795UKMFR9' },
      { externalOrderId: '405-7777777-2222222', orderDate: '2026-02-18T11:20:00.000Z', currency: 'EUR', buyerName: 'Julia Klein', amount: '149.00', marketplaceId: 'A1PA6795UKMFR9' }
    ] }
  },
  'high-volume': {
    organization: { id: 'org_demo', name: 'Invoxa Scale Ops GmbH', slug: 'invoxa-scale', invoicePrefix: 'INV', legalName: 'Invoxa Scale Ops GmbH', onboardingComplete: true, vatId: 'DE987654321', defaultCurrency: 'EUR' },
    users: [{ id: 'usr_demo', email: 'ops@invoxa.app', name: 'Ops Admin', password: 'demo123' }],
    sessions: [],
    customers: [...baseCustomers, { id: 'cus_4', organizationId: 'org_demo', name: 'Electro France SARL', email: 'billing@electro.fr', company: 'Electro France SARL', vatId: 'FR12345678901', source: 'amazon' }],
    invoices: Array.from({ length: 24 }).map((_, index) => ({
      id: `inv_hv_${index + 1}`,
      organizationId: 'org_demo',
      customerId: index % 2 === 0 ? 'cus_1' : 'cus_4',
      invoiceNumber: `INV-2026-${String(index + 1).padStart(4, '0')}`,
      status: index % 5 === 0 ? 'OVERDUE' : index % 3 === 0 ? 'PAID' : 'SENT',
      issueDate: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + (14 - index % 10) * 24 * 60 * 60 * 1000).toISOString(),
      currency: 'EUR',
      subtotal: '120.00',
      taxTotal: '22.80',
      total: '142.80',
      source: 'amazon',
      externalOrderId: `405-8000000-${String(index + 1).padStart(7, '0')}`,
      lineItems: [{ description: `Amazon order batch item ${index + 1}`, quantity: 1, unitPrice: '120.00', taxRate: 19, total: '142.80', sku: `SKU-${index + 1}` }]
    })),
    integrations: [
      { id: 'int_1', organizationId: 'org_demo', type: 'AMAZON', status: 'ACTIVE', lastSyncAt: new Date().toISOString(), syncCursor: '2026-02-18T12:30:00Z' },
      { id: 'int_2', organizationId: 'org_demo', type: 'SHOPIFY', status: 'ACTIVE', lastSyncAt: new Date().toISOString(), syncCursor: '2026-02-18T12:31:00Z' }
    ],
    onboarding: { state: { company: true, branding: true, tax: true, integrations: true, preview: true } },
    amazon: { pendingOrders: Array.from({ length: 10 }).map((_, idx) => ({ externalOrderId: `405-9000000-${1000000 + idx}`, orderDate: new Date(Date.now() - idx * 30 * 60_000).toISOString(), currency: 'EUR', buyerName: `Buyer ${idx + 1}`, amount: String(35 + idx * 7), marketplaceId: 'A1PA6795UKMFR9' })) }
  },
  'onboarding-incomplete': {
    organization: { id: 'org_demo', name: 'New Seller UG', slug: 'new-seller', invoicePrefix: 'INV', legalName: 'New Seller UG', onboardingComplete: false, defaultCurrency: 'EUR' },
    users: [{ id: 'usr_demo', email: 'founder@newseller.app', name: 'Founder', password: 'demo123' }],
    sessions: [],
    customers: [],
    invoices: [],
    integrations: [],
    onboarding: { state: { company: true, branding: false, tax: false, integrations: false, preview: false } },
    amazon: { pendingOrders: [] }
  },
  'integration-errors': {
    organization: { id: 'org_demo', name: 'Broken Sync Test GmbH', slug: 'broken-sync', invoicePrefix: 'INV', legalName: 'Broken Sync Test GmbH', onboardingComplete: true, vatId: 'DE111222333', defaultCurrency: 'EUR' },
    users: [{ id: 'usr_demo', email: 'ops@broken.test', name: 'Ops', password: 'demo123' }],
    sessions: [],
    customers: baseCustomers,
    invoices: baseInvoices,
    integrations: [
      { id: 'int_1', organizationId: 'org_demo', type: 'AMAZON', status: 'ERROR', lastSyncAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString(), errorMessage: 'Access token expired and refresh failed.' },
      { id: 'int_2', organizationId: 'org_demo', type: 'TEMU', status: 'ERROR', lastSyncAt: new Date(Date.now() - 6 * 60 * 60_000).toISOString(), errorMessage: 'CSV schema changed: missing column Order Date.' }
    ],
    onboarding: { state: { company: true, branding: true, tax: true, integrations: true, preview: true } },
    amazon: { pendingOrders: [] }
  }
};
