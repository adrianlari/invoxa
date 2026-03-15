'use client';

import { useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export function CsvImportDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState('');

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <CardTitle>Temu CSV import</CardTitle>
      </CardHeader>
      <CardContent>
      <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const csv = await file.text();
        const res = await apiClient.post('/integrations/temu/import', { csv });
        setResult(`Imported ${res.count ?? 0} orders`);
      }} />
      <Button onClick={() => inputRef.current?.click()}>
        Upload CSV
      </Button>
      {result && <p className="mt-2 text-sm text-emerald-700">{result}</p>}
      </CardContent>
    </Card>
  );
}
