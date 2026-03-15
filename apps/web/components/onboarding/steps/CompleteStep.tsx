'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CompleteStep() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>You're all set</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div data-testid="integration-status" className="flex items-center gap-2 rounded-lg bg-emerald-100 p-2 text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Connected
        </div>
        <div data-testid="first-sync-status" className="rounded-lg border p-3">New Amazon orders will sync automatically.</div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => router.push('/integrations')}>Back to integrations</Button>
          <Button className="flex-1" onClick={() => router.push('/invoices')}>View invoices</Button>
        </div>
      </CardContent>
    </Card>
  );
}
