import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { AppNav } from '@/components/layout/app-nav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen px-4 py-6 md:px-6">
      <main>
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_16px_50px_-20px_rgba(15,23,42,0.4)] backdrop-blur-sm md:p-6">
          <div className="pointer-events-none absolute -right-20 -top-16 h-44 w-44 rounded-full bg-blue-200/50 blur-2xl" />
          <div className="pointer-events-none absolute -left-8 -bottom-16 h-36 w-36 rounded-full bg-cyan-100/50 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Invoxa Suite</p>
              <div className="mt-1 text-3xl font-semibold text-brand-900">Control panel</div>
            </div>
            <ThemeSwitcher />
          </div>
          <AppNav />
        </div>
        {children}
      </main>
    </div>
  );
}
