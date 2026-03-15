'use client';

import Link from 'next/link';
import { useInvoices } from '@/lib/hooks/use-invoices';
import { InvoiceStatusBadge } from '@/components/invoice/invoice-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function InvoicesPage() {
  const { data, isLoading } = useInvoices();

  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Invoices</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Track statuses, open detail pages, and trigger invoice actions.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{data?.pagination?.total ?? 0} total</Badge>
            <Button asChild size="sm"><Link href="/invoices/new">New</Link></Button>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="pt-6">
          {isLoading && <p>Loading...</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Link href={`/invoices/${invoice.id}`} className="font-medium hover:underline">{invoice.invoiceNumber}</Link>
                  </TableCell>
                  <TableCell>{invoice.customer?.name ?? 'N/A'}</TableCell>
                  <TableCell>{invoice.total ? `€${invoice.total}` : '-'}</TableCell>
                  <TableCell><InvoiceStatusBadge status={invoice.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
