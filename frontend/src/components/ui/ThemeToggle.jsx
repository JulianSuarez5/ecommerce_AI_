import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch { return false; }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (isDark) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
      else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
    } catch { /* noop */ }
  }, [isDark]);

  return (
    <button
      aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
      onClick={() => setIsDark((v) => !v)}
      className="p-2 rounded-xl transition-all duration-200 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-800 dark:hover:text-zinc-200"
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
