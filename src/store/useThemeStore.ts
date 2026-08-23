import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_THEME, isThemeId, type ThemeId } from '../themes';

interface ThemeState {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const getInitialTheme = (): ThemeId =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'midnight' : DEFAULT_THEME;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      setTheme: (theme) => set({ theme: isThemeId(theme) ? theme : DEFAULT_THEME }),
    }),
    {
      name: 'homeros-theme',
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0) {
          const old = persisted as { isDarkMode?: boolean } | undefined;
          return { theme: old?.isDarkMode ? 'midnight' : DEFAULT_THEME } as ThemeState;
        }
        const state = persisted as ThemeState;
        return isThemeId(state?.theme) ? state : ({ theme: DEFAULT_THEME } as ThemeState);
      },
    }
  )
);
