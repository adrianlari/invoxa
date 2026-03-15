'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building2, Palette, Receipt, Cable, Eye, Check, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { key: 'company', label: 'Company', icon: Building2, description: 'Tell us about your business' },
  { key: 'branding', label: 'Branding', icon: Palette, description: 'Customize your invoices' },
  { key: 'tax', label: 'Tax rates', icon: Receipt, description: 'Set up tax rates for your region' },
  { key: 'integrations', label: 'Integrations', icon: Cable, description: 'Connect your marketplaces' },
  { key: 'preview', label: 'Preview', icon: Eye, description: 'Review and finish setup' },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

type CompanyData = { legalName: string; address: string; city: string; zip: string; country: string; vatId: string };
type BrandingData = { invoicePrefix: string; defaultCurrency: string; paymentTermsDays: string };
type TaxRate = { name: string; rate: string; country: string; isDefault: boolean };

export function OnboardingWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  const [company, setCompany] = useState<CompanyData>({ legalName: '', address: '', city: '', zip: '', country: 'DE', vatId: '' });
  const [branding, setBranding] = useState<BrandingData>({ invoicePrefix: 'INV', defaultCurrency: 'EUR', paymentTermsDays: '14' });
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    { name: 'Standard VAT', rate: '19', country: 'DE', isDefault: true },
    { name: 'Reduced VAT', rate: '7', country: 'DE', isDefault: false },
  ]);

  const step = STEPS[stepIndex];

  const goNext = (stepKey: StepKey) => {
    setCompleted((prev) => ({ ...prev, [stepKey]: true }));
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  };

  const finish = () => {
    setCompleted((prev) => ({ ...prev, preview: true }));
    setFinished(true);
  };

  if (finished) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CardContent className="py-12">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h2 className="mb-2 text-2xl font-bold">Setup complete!</h2>
          <p className="text-slate-500">Your account is ready. Head to the Integrations page to connect Amazon and start syncing orders.</p>
          <Button className="mt-6" onClick={() => window.location.href = '/integrations'}>
            Go to Integrations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      {/* Sidebar stepper */}
      <Card className="h-fit">
        <CardContent className="p-4">
          <nav className="space-y-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = completed[s.key];
              const active = i === stepIndex;
              return (
                <button
                  key={s.key}
                  onClick={() => setStepIndex(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    active ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    done ? 'bg-green-100 text-green-700' : active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  </span>
                  {s.label}
                </button>
              );
            })}
          </nav>
        </CardContent>
      </Card>

      {/* Step content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{step.label}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </div>
            <Badge variant="secondary">Step {stepIndex + 1} of {STEPS.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step.key === 'company' && (
            <CompanyStep data={company} onChange={setCompany} />
          )}
          {step.key === 'branding' && (
            <BrandingStep data={branding} onChange={setBranding} />
          )}
          {step.key === 'tax' && (
            <TaxStep rates={taxRates} onChange={setTaxRates} />
          )}
          {step.key === 'integrations' && (
            <IntegrationsStep />
          )}
          {step.key === 'preview' && (
            <PreviewStep company={company} branding={branding} taxRates={taxRates} />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" disabled={stepIndex === 0} onClick={() => setStepIndex(stepIndex - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step.key === 'preview' ? (
              <Button onClick={finish}>
                Complete setup
              </Button>
            ) : (
              <Button onClick={() => goNext(step.key)}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Step: Company ─── */

function CompanyStep({ data, onChange }: { data: CompanyData; onChange: (d: CompanyData) => void }) {
  const set = (field: keyof CompanyData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...data, [field]: e.target.value });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Legal company name" span={2}>
        <Input placeholder="Acme GmbH" value={data.legalName} onChange={set('legalName')} />
      </Field>
      <Field label="Street address" span={2}>
        <Input placeholder="Musterstraße 1" value={data.address} onChange={set('address')} />
      </Field>
      <Field label="City">
        <Input placeholder="Berlin" value={data.city} onChange={set('city')} />
      </Field>
      <Field label="ZIP code">
        <Input placeholder="10115" value={data.zip} onChange={set('zip')} />
      </Field>
      <Field label="Country">
        <select
          value={data.country}
          onChange={set('country')}
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
        >
          <option value="DE">Germany</option>
          <option value="AT">Austria</option>
          <option value="CH">Switzerland</option>
          <option value="FR">France</option>
          <option value="NL">Netherlands</option>
        </select>
      </Field>
      <Field label="VAT ID">
        <Input placeholder="DE123456789" value={data.vatId} onChange={set('vatId')} />
      </Field>
    </div>
  );
}

/* ─── Step: Branding ─── */

function BrandingStep({ data, onChange }: { data: BrandingData; onChange: (d: BrandingData) => void }) {
  const set = (field: keyof BrandingData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...data, [field]: e.target.value });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Invoice number prefix">
        <Input placeholder="INV" value={data.invoicePrefix} onChange={set('invoicePrefix')} />
        <p className="mt-1 text-xs text-slate-400">Preview: {data.invoicePrefix}-2026-0001</p>
      </Field>
      <Field label="Default currency">
        <select
          value={data.defaultCurrency}
          onChange={set('defaultCurrency')}
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
        >
          <option value="EUR">EUR - Euro</option>
          <option value="USD">USD - US Dollar</option>
          <option value="GBP">GBP - British Pound</option>
          <option value="RON">RON - Romanian Leu</option>
        </select>
      </Field>
      <Field label="Payment terms (days)">
        <Input type="number" min="1" max="90" placeholder="14" value={data.paymentTermsDays} onChange={set('paymentTermsDays')} />
        <p className="mt-1 text-xs text-slate-400">Invoices will be due {data.paymentTermsDays} days after issue date</p>
      </Field>
      <div className="sm:col-span-2">
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
          <Palette className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">Logo upload coming soon</p>
          <p className="text-xs text-slate-400">Your logo will appear on generated invoices</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Step: Tax ─── */

function TaxStep({ rates, onChange }: { rates: TaxRate[]; onChange: (r: TaxRate[]) => void }) {
  const update = (index: number, field: keyof TaxRate, value: string | boolean) => {
    const next = [...rates];
    next[index] = { ...next[index], [field]: value };
    if (field === 'isDefault' && value === true) {
      next.forEach((r, i) => { if (i !== index) r.isDefault = false; });
    }
    onChange(next);
  };

  const addRate = () => onChange([...rates, { name: '', rate: '', country: 'DE', isDefault: false }]);
  const removeRate = (index: number) => onChange(rates.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {rates.map((rate, index) => (
        <div key={index} className="flex items-center gap-3 rounded-lg border p-3">
          <div className="flex-1 grid gap-3 sm:grid-cols-4">
            <Input placeholder="Rate name" value={rate.name} onChange={(e) => update(index, 'name', e.target.value)} />
            <div className="relative">
              <Input type="number" placeholder="19" value={rate.rate} onChange={(e) => update(index, 'rate', e.target.value)} className="pr-8" />
              <span className="absolute right-3 top-2.5 text-sm text-slate-400">%</span>
            </div>
            <Input placeholder="Country" value={rate.country} onChange={(e) => update(index, 'country', e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rate.isDefault}
                onChange={(e) => update(index, 'isDefault', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Default
            </label>
          </div>
          <Button variant="ghost" size="sm" onClick={() => removeRate(index)} className="shrink-0 text-slate-400 hover:text-red-500">
            &times;
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addRate}>+ Add tax rate</Button>
    </div>
  );
}

/* ─── Step: Integrations ─── */

function IntegrationsStep() {
  const marketplaces = [
    { name: 'Amazon', description: 'Sync shipped/unshipped orders automatically', connected: false, icon: '🛒' },
    { name: 'Shopify', description: 'Import storefront orders', connected: false, icon: '🏪' },
    { name: 'Temu', description: 'CSV batch import from Temu exports', connected: false, icon: '📦' },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">Connect at least one marketplace to start syncing orders. You can add more later.</p>
      {marketplaces.map((mp) => (
        <div key={mp.name} className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{mp.icon}</span>
            <div>
              <div className="font-medium text-sm">{mp.name}</div>
              <div className="text-xs text-slate-500">{mp.description}</div>
            </div>
          </div>
          <Button variant="outline" size="sm">Connect</Button>
        </div>
      ))}
      <p className="text-xs text-slate-400">You can skip this step and connect integrations later from the Integrations page.</p>
    </div>
  );
}

/* ─── Step: Preview ─── */

function PreviewStep({ company, branding, taxRates }: { company: CompanyData; branding: BrandingData; taxRates: TaxRate[] }) {
  const defaultRate = taxRates.find((r) => r.isDefault) ?? taxRates[0];

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Review your settings before completing setup. You can always change these later.</p>

      <SummarySection title="Company">
        <SummaryRow label="Legal name" value={company.legalName || '—'} />
        <SummaryRow label="Address" value={[company.address, company.zip, company.city].filter(Boolean).join(', ') || '—'} />
        <SummaryRow label="Country" value={company.country} />
        <SummaryRow label="VAT ID" value={company.vatId || '—'} />
      </SummarySection>

      <SummarySection title="Branding">
        <SummaryRow label="Invoice prefix" value={branding.invoicePrefix} />
        <SummaryRow label="Currency" value={branding.defaultCurrency} />
        <SummaryRow label="Payment terms" value={`${branding.paymentTermsDays} days`} />
      </SummarySection>

      <SummarySection title="Tax rates">
        {taxRates.map((r, i) => (
          <SummaryRow key={i} label={r.name || `Rate ${i + 1}`} value={`${r.rate}% (${r.country})${r.isDefault ? ' — default' : ''}`} />
        ))}
      </SummarySection>
    </div>
  );
}

/* ─── Shared helpers ─── */

function Field({ label, children, span }: { label: string; children: React.ReactNode; span?: number }) {
  return (
    <div className={span === 2 ? 'sm:col-span-2' : ''}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4">
      <h4 className="mb-2 text-sm font-medium text-slate-900">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
