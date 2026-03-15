'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { InvoicePdfPreview } from '@/components/invoice/invoice-pdf-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    apiClient.get(`/invoices/${params.id}`).then(setInvoice);
  }, [params.id]);

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Invoice detail</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => apiClient.get(`/invoices/${params.id}/pdf`).then((res) => setInvoice((prev: any) => ({ ...prev, pdfUrl: res.url })))}>
              Generate PDF
            </Button>
            <Button size="sm" onClick={() => apiClient.post(`/invoices/${params.id}/send`)}>
              Send
            </Button>
          </div>
        </CardHeader>
        <CardContent><p className="text-sm text-slate-600">{invoice?.invoiceNumber ?? '...'}</p></CardContent>
      </Card>
      <InvoicePdfPreview url={invoice?.pdfUrl} />
    </section>
  );
}
