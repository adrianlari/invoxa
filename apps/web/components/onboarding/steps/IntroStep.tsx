'use client';

import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StepProps } from '@/types/amazon-wizard.types';

export function IntroStep({ update }: StepProps) {
  const items = [
    'Your order history and new orders (read-only)',
    'Shipping addresses for legal invoice generation',
    'Order totals and line items'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect your Amazon seller account</CardTitle>
        <p className="text-sm text-slate-500">Billflow imports Amazon orders and generates invoices automatically.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-xl border p-4">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <Button className="w-full" onClick={() => update({ step: 'marketplace' })}>Get started</Button>
      </CardContent>
    </Card>
  );
}
