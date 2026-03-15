'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AmazonMarketplace, StepProps } from '@/types/amazon-wizard.types';

const MARKETPLACES: Array<{ id: AmazonMarketplace; name: string; flag: string; region: string }> = [
  { id: 'DE', name: 'Amazon.de', flag: 'DE', region: 'Germany launch' }
];

export function MarketplaceStep({ state, update }: StepProps) {
  const [selected, setSelected] = useState<AmazonMarketplace | null>(state.selectedMarketplace ?? 'DE');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select your marketplace</CardTitle>
        <p className="text-sm text-slate-500">Current rollout supports Germany only. Additional marketplaces can be enabled later.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {MARKETPLACES.map((mp) => (
            <button
              data-testid={`marketplace-${mp.id}`}
              key={mp.id}
              onClick={() => setSelected(mp.id)}
              className={`rounded-xl border p-3 text-left ${selected === mp.id ? 'border-[var(--accent)] bg-slate-100' : 'border-[var(--border)]'}`}
            >
              <div className="font-medium">{mp.name}</div>
              <div className="text-xs text-slate-500">{mp.region}</div>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => update({ step: 'intro' })}>Back</Button>
          <Button data-testid="wizard-next" disabled={!selected} className="flex-1" onClick={() => update({ step: 'permissions', selectedMarketplace: selected })}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
}
