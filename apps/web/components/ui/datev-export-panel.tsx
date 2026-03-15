'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Input } from './input';

export function DatevExportPanel() {
  const [from, setFrom] = useState('2025-01-01');
  const [to, setTo] = useState('2025-12-31');
  const [csv, setCsv] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>DATEV Export</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid gap-2 md:grid-cols-3">
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button
          onClick={async () => {
            const res = await apiClient.get(`/exports/datev?from=${from}&to=${to}`);
            setCsv(res.content ?? '');
          }}
        >
          Generate
        </Button>
      </div>
      {csv && <pre className="mt-4 max-h-96 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">{csv}</pre>}
      </CardContent>
    </Card>
  );
}
