'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    apiClient.get(`/customers/${params.id}`).then(setCustomer);
  }, [params.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{customer?.name ?? 'Customer'}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <span className="text-sm text-slate-500">Invoice history</span>
        <Badge variant="secondary">{customer?.invoices?.length ?? 0}</Badge>
      </CardContent>
    </Card>
  );
}
