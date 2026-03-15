'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function NewInvoicePage() {
  const [customerId, setCustomerId] = useState('');
  const [created, setCreated] = useState('');

  return (
    <Card>
      <CardHeader><CardTitle>Create invoice</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:max-w-md">
        <Input value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="Customer ID" />
        <Button
          onClick={async () => {
            const res = await apiClient.post('/invoices', {
              customerId,
              lineItems: [{ description: 'Service', quantity: 1, unitPrice: '100.00', taxRate: 19 }]
            });
            setCreated(res.invoiceNumber ?? res.id);
          }}
        >
          Create
        </Button>
        {created && <p className="text-sm text-emerald-700">Created {created}</p>}
      </CardContent>
    </Card>
  );
}
