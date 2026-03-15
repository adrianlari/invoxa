'use client';

import { useTheme, type AppTheme } from '@/app/theme-provider';
import { Button } from './button';

const THEMES: Array<{ key: AppTheme; label: string }> = [
  { key: 'light', label: 'Light' },
  { key: 'sand', label: 'Sand' },
  { key: 'night', label: 'Night' }
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-1">
      {THEMES.map((entry) => (
        <Button
          key={entry.key}
          onClick={() => setTheme(entry.key)}
          variant={theme === entry.key ? 'default' : 'ghost'}
          size="sm"
          className="h-8 text-xs"
          type="button"
        >
          {entry.label}
        </Button>
      ))}
    </div>
  );
}
