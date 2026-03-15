'use client';

import { apiClient } from '@/lib/api-client';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Cable, ShoppingBag, Store } from 'lucide-react';

export function MarketplaceConnectCard({ title, type }: { title: string; type: 'amazon' | 'shopify' | 'temu' }) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';
  const Icon = type === 'amazon' ? ShoppingBag : type === 'shopify' ? Store : Cable;
  const subtitle =
    type === 'amazon'
      ? 'Sync shipped/unshipped orders and auto-generate invoices.'
      : type === 'shopify'
      ? 'Connect storefront orders and keep invoice status aligned.'
      : 'Import CSV batches from marketplace exports.';

  const connect = async () => {
    if (type === 'amazon') {
      const res = await apiClient.get('/integrations/amazon/connect?marketplace=DE');
      if (!useMock) {
        window.location.href = res.authUrl;
      } else {
        window.location.href = '/integrations/amazon/wizard?step=intro';
      }
      return;
    }

    if (type === 'shopify') {
      await apiClient.post('/integrations/shopify/connect');
      return;
    }

    await apiClient.post('/integrations/temu/import', { csv: '' });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </CardTitle>
          <Badge variant={useMock ? 'secondary' : 'default'}>{useMock ? 'Mock' : 'Live'}</Badge>
        </div>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <Button data-testid={type === 'amazon' ? 'connect-amazon' : undefined} onClick={connect}>Connect</Button>
      </CardContent>
    </Card>
  );
}
