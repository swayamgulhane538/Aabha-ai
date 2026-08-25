import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  getResolvedTheme: () => ResolvedTheme;
}

/** Resolve what 'system' means by checking OS preference */
function resolveSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Apply the resolved theme to <html> */
function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const resolved: ResolvedTheme = mode === 'system' ? resolveSystemTheme() : mode;
  document.documentElement.setAttribute('data-theme', resolved);
  // Also set color-scheme for native form controls
  document.documentElement.style.colorScheme = resolved;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light' as ThemeMode,

      setTheme: (theme: ThemeMode) => {
        set({ theme });
        applyTheme(theme);
      },

      getResolvedTheme: (): ResolvedTheme => {
        const { theme } = get();
        if (theme === 'system') return resolveSystemTheme();
        return theme;
      },
    }),
    {
      name: 'aabha-theme',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        }
      },
    }
  )
);

// ── Initialize theme on first load ──────────────────────────────────────────
if (typeof document !== 'undefined') {
  // Apply immediately from localStorage to avoid flash
  try {
    const stored = JSON.parse(localStorage.getItem('aabha-theme') || '{}');
    const mode: ThemeMode = stored?.state?.theme || 'light';
    applyTheme(mode);
  } catch {
    applyTheme('light');
  }

  // Listen for OS theme changes when in 'system' mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    const currentTheme = useThemeStore.getState().theme;
    if (currentTheme === 'system') {
      applyTheme('system');
    }
  });
}
