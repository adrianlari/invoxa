import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Banknote, Clock3, FileText, ReceiptText } from 'lucide-react';

export default function DashboardPage() {
  return (
    <section className="grid gap-4 md:grid-cols-6">
      <Card className="relative overflow-hidden md:col-span-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-100/80 via-transparent to-cyan-100/70" />
        <CardHeader className="relative">
          <CardTitle className="text-sm text-slate-500">This month snapshot</CardTitle>
        </CardHeader>
        <CardContent className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-3xl font-semibold md:text-4xl">€12,480.50</p>
            <p className="mt-1 text-sm text-slate-500">Projected VAT liability: €2,371.30</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/invoices/new">Create invoice</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/exports">Run DATEV export</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm text-slate-500">Revenue (30d)</CardTitle>
          <Banknote className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent><p className="text-3xl font-semibold">€9,822.90</p></CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm text-slate-500">Invoices issued</CardTitle>
          <FileText className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent><p className="text-3xl font-semibold">247</p></CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm text-slate-500">Overdue follow-ups</CardTitle>
          <Clock3 className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent><p className="text-3xl font-semibold">14</p></CardContent>
      </Card>
      <Card className="md:col-span-3">
        <CardHeader><CardTitle>Operational queue</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-slate-100 p-3">
            <span>Amazon orders pending sync</span>
            <strong>21</strong>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-100 p-3">
            <span>PDF generation jobs</span>
            <strong>7</strong>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-100 p-3">
            <span>DATEV export freshness</span>
            <strong>Today</strong>
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-3">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Quick actions</CardTitle>
          <ReceiptText className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary"><Link href="/onboarding">Complete onboarding</Link></Button>
          <Button asChild variant="outline"><Link href="/integrations">Review integrations</Link></Button>
          <Button asChild variant="ghost"><Link href="/customers">Open customers <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </CardContent>
      </Card>
    </section>
  );
}
