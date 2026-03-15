'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { BarChart3, Building2, Cable, FileText, Rocket, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { label: 'Dashboard', href: '/dashboard' as Route, icon: BarChart3 },
  { label: 'Onboarding', href: '/onboarding' as Route, icon: Rocket },
  { label: 'Invoices', href: '/invoices' as Route, icon: FileText },
  { label: 'Customers', href: '/customers' as Route, icon: Users },
  { label: 'Integrations', href: '/integrations' as Route, icon: Cable },
  { label: 'Exports', href: '/exports' as Route, icon: FileText },
  { label: 'Company', href: '/settings/company' as Route, icon: Building2 }
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors',
              active
                ? 'border-transparent bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'border-[var(--border)] bg-[var(--panel-soft)] text-[var(--text)] hover:brightness-95'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
