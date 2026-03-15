'use client';

import { useMutation } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StepProps } from '@/types/amazon-wizard.types';

export function PermissionsStep({ state, update }: StepProps) {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => apiClient.get(`/integrations/amazon/connect?marketplace=${state.selectedMarketplace ?? 'DE'}`)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions we'll request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div data-testid="permissions-list" className="space-y-2 rounded-xl border p-4">
          <div className="flex gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Orders API access (read-only)</div>
          <div className="flex gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Buyer info for legal invoices</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => update({ step: 'marketplace' })}>Back</Button>
          <Button
            className="flex-1"
            onClick={async () => {
              const res = await mutateAsync();
              update({ step: 'oauth' });
              setTimeout(() => {
                const mock = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';
                if (mock) {
                  const callback = `/integrations/amazon/wizard?step=syncing&jobId=mock-job&integrationId=int_1`;
                  window.history.pushState({}, '', callback);
                  update({ step: 'syncing', syncJobId: 'mock-job', integrationId: 'int_1' });
                } else {
                  window.location.href = res.authUrl;
                }
              }, 500);
            }}
            data-testid="connect-amazon-oauth"
            disabled={isPending}
          >
            Connect with Amazon
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
