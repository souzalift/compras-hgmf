'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null;

    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      const initialTheme: Theme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      document.documentElement.classList.toggle('dark', prefersDark);
    }

    setMounted(true);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  return (
    <button
      onClick={toggleTheme}
      disabled={!mounted}
      className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-surface2 disabled:opacity-60"
      aria-label="Alternar tema"
      type="button"
    >
      {theme === 'dark' ? '🌙 Escuro' : '☀️ Claro'}
    </button>
  );
}
