const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

let authToken = '';
let organizationId = '';
const TOKEN_KEY = 'invoxa.auth.token';
const ORG_KEY = 'invoxa.auth.organizationId';

if (typeof window !== 'undefined') {
  authToken = window.localStorage.getItem(TOKEN_KEY) ?? '';
  organizationId = window.localStorage.getItem(ORG_KEY) ?? '';
}

export function setApiContext(ctx: { token?: string; organizationId?: string }) {
  if (ctx.token !== undefined) {
    authToken = ctx.token;
    if (typeof window !== 'undefined') {
      if (ctx.token) window.localStorage.setItem(TOKEN_KEY, ctx.token);
      else window.localStorage.removeItem(TOKEN_KEY);
    }
  }
  if (ctx.organizationId !== undefined) {
    organizationId = ctx.organizationId;
    if (typeof window !== 'undefined') {
      if (ctx.organizationId) window.localStorage.setItem(ORG_KEY, ctx.organizationId);
      else window.localStorage.removeItem(ORG_KEY);
    }
  }
}

async function request(path: string, init?: RequestInit) {
  if (USE_MOCK_DATA) {
    const { mockRequest } = await import('./mock-data/handlers');
    return mockRequest(path, init);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      authorization: authToken ? `Bearer ${authToken}` : '',
      'x-organization-id': organizationId,
      ...(init?.headers ?? {})
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }

  return response.json();
}

export const apiClient = {
  get: (path: string) => request(path),
  post: (path: string, body?: unknown) => request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: (path: string, body?: unknown) => request(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  delete: (path: string) => request(path, { method: 'DELETE' })
};
