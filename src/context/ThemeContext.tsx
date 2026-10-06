import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Nâng cấp Phần A — chủ đề sáng/tối.
 * Context riêng, tách hoàn toàn khỏi FilterTabsContext và Redux:
 * chỉ component tiêu thụ useTheme() mới re-render khi đổi theme,
 * phần còn lại của app chỉ đổi màu qua thuộc tính data-theme trên <html>.
 */
export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'sdt-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// Áp dụng chủ đề ngay khi nạp module để không bị nhấp nháy sáng→tối ở lần render đầu
if (typeof document !== 'undefined') {
  document.documentElement.dataset.theme = getInitialTheme();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // value bọc useMemo — chỉ tạo object mới khi theme thực sự đổi
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme phải được dùng bên trong <ThemeProvider>.');
  }
  return ctx;
}
