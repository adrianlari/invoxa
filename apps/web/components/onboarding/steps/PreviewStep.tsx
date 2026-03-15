'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceStatusBadge } from '@/components/invoice/invoice-status-badge';
import type { StepProps } from '@/types/amazon-wizard.types';

export function PreviewStep({ state, update }: StepProps) {
  const { data } = useQuery({
    queryKey: ['amazon-preview-orders'],
    queryFn: () => apiClient.get('/integrations/amazon/orders/preview?limit=5')
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{state.syncedOrderCount} invoices ready</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div data-testid="synced-orders-preview" className="space-y-2 rounded-xl border p-3">
          {(data?.orders ?? []).slice(0, 5).map((order: any) => (
            <div key={order.externalOrderId} data-testid="order-row" className="flex items-center justify-between rounded-lg bg-slate-100 p-2">
              <div>
                <div className="text-sm font-medium">{order.externalOrderId}</div>
                <div className="text-xs text-slate-500">{order.buyerName ?? 'Buyer'}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">{order.amount} {order.currency}</div>
                <InvoiceStatusBadge status="DRAFT" />
              </div>
            </div>
          ))}
        </div>
        <Button data-testid="generate-all-invoices" className="w-full" onClick={() => update({ step: 'complete' })}>Generate all invoices</Button>
      </CardContent>
    </Card>
  );
}
