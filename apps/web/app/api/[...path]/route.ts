import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

async function proxy(request: NextRequest, method: string, path: string[]) {
  const url = `${API_URL}/${path.join('/')}${request.nextUrl.search}`;
  const body = method === 'GET' || method === 'DELETE' ? undefined : await request.text();

  const response = await fetch(url, {
    method,
    headers: {
      'content-type': 'application/json',
      authorization: request.headers.get('authorization') ?? '',
      'x-organization-id': request.headers.get('x-organization-id') ?? ''
    },
    body
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/json'
    }
  });
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, 'GET', params.path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, 'POST', params.path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, 'PUT', params.path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, 'DELETE', params.path);
}
