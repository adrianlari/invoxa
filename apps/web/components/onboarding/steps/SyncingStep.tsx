'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StepProps } from '@/types/amazon-wizard.types';

export function SyncingStep({ state, update }: StepProps) {
  const { data } = useQuery({
    queryKey: ['amazon-sync', state.syncJobId],
    enabled: !!state.syncJobId,
    queryFn: () => apiClient.get(`/integrations/amazon/sync-status/${state.syncJobId}`),
    refetchInterval: (query) => ((query.state.data as any)?.state === 'completed' ? false : 1200)
  });

  useEffect(() => {
    if (data?.state === 'completed') {
      update({ step: 'preview', syncedOrderCount: data.ordersFound ?? 0 });
    }
  }, [data?.state, data?.ordersFound, update]);

  const percent = data?.progress?.percent ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amazon connected. Syncing orders...</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-sm text-slate-500">{data?.invoicesCreated ?? 0} / {data?.ordersFound ?? 0} invoices created</p>
      </CardContent>
    </Card>
  );
}
