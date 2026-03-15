import { activeMockScenario, mockDb, nextInvoiceNumber } from './db';

function json<T>(data: T): Promise<T> {
  return Promise.resolve(structuredClone(data));
}

function findInvoice(id: string) {
  return mockDb.invoices.find((invoice) => invoice.id === id);
}

function findCustomer(id: string) {
  return mockDb.customers.find((customer) => customer.id === id);
}

function toDatevCsv(from: string, to: string) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const rows = mockDb.invoices.filter((invoice) => {
    const d = new Date(invoice.issueDate);
    return d >= fromDate && d <= toDate;
  });

  const header = '"EXTF";700;21;"Buchungsstapel";4;20260101120000000;;"RE";"";"";"";1000;20260101;4;"";"";"";"";"";;""';
  const lines = rows.map((invoice) => {
    const customer = findCustomer(invoice.customerId);
    return `${invoice.total};S;${invoice.currency};1;;;10000;8400;;0102;${invoice.invoiceNumber};${customer?.name ?? 'Unknown customer'}`;
  });

  return [header, ...lines].join('\n');
}

export async function mockRequest(path: string, init?: RequestInit) {
  const method = (init?.method ?? 'GET').toUpperCase();
  const body = init?.body ? JSON.parse(String(init.body)) : {};
  const url = new URL(path, 'http://mock.local');
  const pathname = url.pathname;

  if (pathname === '/auth/register' && method === 'POST') {
    const user = { id: `usr_${mockDb.users.length + 1}`, email: body.email, name: body.name, password: body.password };
    mockDb.users.push(user);
    return json({ user, defaultOrganizationId: mockDb.organization.id });
  }

  if (pathname === '/auth/login' && method === 'POST') {
    const user = mockDb.users.find((candidate) => candidate.email === body.email) ?? mockDb.users[0];
    const token = `mock_session_${Date.now()}`;
    mockDb.sessions.push({ token, userId: user.id });
    return json({
      user: { id: user.id, email: user.email, name: user.name },
      session: { token },
      defaultOrganizationId: mockDb.organization.id,
      organizations: [{ organizationId: mockDb.organization.id, role: 'OWNER', organizationName: mockDb.organization.name }],
      mockScenario: activeMockScenario
    });
  }

  if (pathname === '/auth/me' && method === 'GET') {
    const user = mockDb.users[0];
    return json({ id: user.id, email: user.email, name: user.name });
  }

  if (pathname === '/onboarding/state' && method === 'GET') {
    return json({ organization: mockDb.organization, completed: mockDb.organization.onboardingComplete, steps: mockDb.onboarding.state });
  }

  if (/^\/onboarding\/step\/.+$/.test(pathname) && method === 'PUT') {
    const step = pathname.split('/')[3] as keyof typeof mockDb.onboarding.state;
    if (step in mockDb.onboarding.state) mockDb.onboarding.state[step] = true;
    if (step === 'company') {
      Object.assign(mockDb.organization, {
        legalName: body.legalName ?? mockDb.organization.legalName,
        vatId: body.vatId ?? mockDb.organization.vatId,
      });
    }
    if (step === 'branding') {
      Object.assign(mockDb.organization, {
        invoicePrefix: body.invoicePrefix ?? mockDb.organization.invoicePrefix,
        defaultCurrency: body.defaultCurrency ?? mockDb.organization.defaultCurrency,
      });
    }
    return json({ success: true, step, steps: mockDb.onboarding.state });
  }

  if (pathname === '/onboarding/complete' && method === 'POST') {
    mockDb.organization.onboardingComplete = true;
    Object.keys(mockDb.onboarding.state).forEach((key) => {
      (mockDb.onboarding.state as any)[key] = true;
    });
    return json({ success: true, completed: true });
  }

  if (pathname === '/organizations/current' && method === 'GET') {
    return json(mockDb.organization);
  }

  if (pathname === '/customers' && method === 'GET') {
    return json(mockDb.customers);
  }

  if (pathname.startsWith('/customers/') && method === 'GET') {
    const id = pathname.split('/')[2];
    const customer = findCustomer(id);
    return json({ ...customer, invoices: mockDb.invoices.filter((invoice) => invoice.customerId === id) });
  }

  if (pathname === '/invoices' && method === 'GET') {
    const data = mockDb.invoices.map((invoice) => ({ ...invoice, customer: findCustomer(invoice.customerId) }));
    return json({ data, pagination: { page: 1, limit: 20, total: data.length, totalPages: 1 } });
  }

  if (pathname === '/invoices' && method === 'POST') {
    const customer = findCustomer(body.customerId) ?? mockDb.customers[0];
    const lineItems = Array.isArray(body.lineItems) && body.lineItems.length > 0
      ? body.lineItems
      : [{ description: 'Manual item', quantity: 1, unitPrice: '100.00', taxRate: 19, total: '119.00' }];

    const subtotal = lineItems.reduce((acc: number, item: any) => acc + Number(item.unitPrice) * Number(item.quantity), 0);
    const taxTotal = lineItems.reduce((acc: number, item: any) => acc + (Number(item.unitPrice) * Number(item.quantity) * Number(item.taxRate)) / 100, 0);

    const invoice = {
      id: `inv_${Date.now()}`,
      organizationId: mockDb.organization.id,
      customerId: customer.id,
      invoiceNumber: nextInvoiceNumber(),
      status: 'DRAFT' as const,
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60_000).toISOString(),
      currency: body.currency ?? mockDb.organization.defaultCurrency,
      subtotal: subtotal.toFixed(2),
      taxTotal: taxTotal.toFixed(2),
      total: (subtotal + taxTotal).toFixed(2),
      notes: body.notes,
      source: body.source ?? 'manual',
      lineItems,
      pdfUrl: undefined
    };

    mockDb.invoices.unshift(invoice);
    return json({ ...invoice, customer });
  }

  if (/^\/invoices\/[^/]+$/.test(pathname) && method === 'GET') {
    const id = pathname.split('/')[2];
    const invoice = findInvoice(id);
    return json(invoice ? { ...invoice, customer: findCustomer(invoice.customerId) } : null);
  }

  if (/^\/invoices\/[^/]+\/pdf$/.test(pathname) && method === 'GET') {
    const id = pathname.split('/')[2];
    const invoice = findInvoice(id);
    if (!invoice) throw new Error('Invoice not found');
    invoice.pdfUrl = invoice.pdfUrl ?? `https://example.com/mock/${id}.pdf`;
    return json({ url: invoice.pdfUrl });
  }

  if (/^\/invoices\/[^/]+\/send$/.test(pathname) && method === 'POST') {
    const id = pathname.split('/')[2];
    const invoice = findInvoice(id);
    if (!invoice) throw new Error('Invoice not found');
    invoice.status = 'SENT';
    return json({ success: true });
  }

  if (/^\/invoices\/[^/]+\/paid$/.test(pathname) && method === 'POST') {
    const id = pathname.split('/')[2];
    const invoice = findInvoice(id);
    if (!invoice) throw new Error('Invoice not found');
    invoice.status = 'PAID';
    return json({ ...invoice });
  }

  if (pathname === '/integrations' && method === 'GET') {
    return json(mockDb.integrations);
  }

  if (pathname === '/integrations/amazon/connect' && (method === 'POST' || method === 'GET')) {
    return json({ authUrl: 'https://sellercentral.amazon.com/apps/authorize/consent?application_id=mock', mode: 'mock' });
  }

  if (pathname === '/integrations/amazon/appstore/login' && method === 'GET') {
    return json({
      appstoreLoginToken: 'mock-appstore-login-token',
      loginUrl: '/login?appstoreLoginToken=mock-appstore-login-token'
    });
  }

  if (pathname === '/integrations/amazon/appstore/continue' && method === 'POST') {
    return json({
      redirectUrl: '/integrations/amazon/wizard?step=syncing&jobId=mock-job&integrationId=int_1',
      organizationId: mockDb.organization.id
    });
  }

  if (/^\/integrations\/amazon\/sync-status\/[^/]+$/.test(pathname) && method === 'GET') {
    const startedAt = (globalThis as any).__mockSyncStartedAt ?? Date.now();
    (globalThis as any).__mockSyncStartedAt = startedAt;
    const elapsed = Date.now() - startedAt;
    const percent = Math.min(100, Math.round((elapsed / 6000) * 100));
    const ordersFound = 5;
    const invoicesCreated = Math.min(ordersFound, Math.round((percent / 100) * ordersFound));
    return json({
      state: percent >= 100 ? 'completed' : 'active',
      progress: { percent, ordersFound, invoicesCreated },
      ordersFound,
      invoicesCreated
    });
  }

  if (pathname === '/integrations/amazon/install/claim' && method === 'POST') {
    return json({
      success: true,
      organizationId: mockDb.organization.id,
      integrationId: 'int_1',
      jobId: 'mock-job',
      redirectPath: '/integrations/amazon/wizard?step=syncing&jobId=mock-job&integrationId=int_1',
      redirectUrl: '/integrations/amazon/wizard?step=syncing&jobId=mock-job&integrationId=int_1'
    });
  }

  if (/^\/integrations\/amazon\/orders\/[^/]+\/detail$/.test(pathname) && method === 'GET') {
    const orderId = pathname.split('/')[4];
    const order = mockDb.amazon.pendingOrders.find((o) => o.externalOrderId === orderId);
    return json({
      externalOrderId: order?.externalOrderId ?? orderId,
      orderDate: order?.orderDate ?? new Date().toISOString(),
      status: 'Shipped',
      amount: order?.amount ?? '149.90',
      currency: order?.currency ?? 'EUR',
      buyerName: order?.buyerName ?? 'Max Mustermann',
      buyerEmail: 'max@example.de',
      marketplaceId: order?.marketplaceId ?? 'A1PA6795UKMFR9',
      fulfillmentChannel: 'MFN',
      shipServiceLevel: 'Std DE Dom',
      numberOfItemsShipped: 2,
      numberOfItemsUnshipped: 0,
      shippingAddress: {
        name: order?.buyerName ?? 'Max Mustermann',
        addressLine1: 'Musterstraße 42',
        city: 'Berlin',
        stateOrRegion: 'Berlin',
        postalCode: '10115',
        countryCode: 'DE',
        phone: '+49 30 12345678',
      },
    });
  }

  if (/^\/integrations\/amazon\/orders\/[^/]+\/items$/.test(pathname) && method === 'GET') {
    return json({
      items: [
        { orderItemId: 'item_001', asin: 'B09V3KXJPB', sellerSku: 'SPK-100-BLK', title: 'Premium Bluetooth Speaker - Waterproof Portable', quantityOrdered: 1, quantityShipped: 1, itemPrice: '89.90', itemTax: '17.08', currency: 'EUR', isGift: false },
        { orderItemId: 'item_002', asin: 'B0BSHF7WHN', sellerSku: 'CBL-USB-C-2M', title: 'USB-C Charging Cable 2m Braided Nylon', quantityOrdered: 2, quantityShipped: 2, itemPrice: '29.99', itemTax: '5.70', currency: 'EUR', isGift: false },
      ]
    });
  }

  if (pathname === '/integrations/amazon/orders/preview' && method === 'GET') {
    return json({ orders: mockDb.amazon.pendingOrders, source: 'mock' });
  }

  if (pathname === '/integrations/shopify/connect' && method === 'POST') {
    return json({ success: true });
  }

  if (pathname === '/integrations/temu/import' && method === 'POST') {
    return json({ count: 3, preview: [{ orderId: 'T-1001' }, { orderId: 'T-1002' }, { orderId: 'T-1003' }] });
  }

  if (/^\/integrations\/[^/]+\/sync-status$/.test(pathname) && method === 'GET') {
    const id = pathname.split('/')[2];
    return json(mockDb.integrations.find((integration) => integration.id === id) ?? null);
  }

  if (pathname === '/exports/datev' && method === 'GET') {
    const from = url.searchParams.get('from') ?? '2026-01-01';
    const to = url.searchParams.get('to') ?? '2026-12-31';
    return json({ filename: 'datev-export.csv', content: toDatevCsv(from, to) });
  }

  throw new Error(`Mock route not implemented: ${method} ${pathname}`);
}
