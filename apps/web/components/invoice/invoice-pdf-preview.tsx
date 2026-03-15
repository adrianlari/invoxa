'use client';

export function InvoicePdfPreview({ url }: { url?: string | null }) {
  if (!url) {
    return <div className="rounded-lg border border-dashed p-8 text-sm text-slate-500">PDF not generated yet.</div>;
  }

  return <iframe title="Invoice PDF" src={url} className="h-[640px] w-full rounded-lg border" />;
}
