'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppTheme = 'light' | 'night' | 'sand';

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'invoxa-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>('light');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as AppTheme | null;
    const resolved = saved && ['light', 'night', 'sand'].includes(saved) ? saved : 'light';
    setTheme(resolved);
    document.documentElement.dataset.theme = resolved;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider');
  return value;
}
