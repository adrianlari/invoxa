'use client';

import { Loader2 } from 'lucide-react';

export function OAuthStep() {
  return (
    <div className="py-12 text-center">
      <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--accent)]" />
      <h2 className="mt-4 text-xl font-semibold">Redirecting to Amazon...</h2>
      <p className="mt-2 text-sm text-slate-500">You'll approve access and return here automatically.</p>
    </div>
  );
}
