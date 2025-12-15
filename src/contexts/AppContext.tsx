import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { Language } from '../i18n/translations';
import type { ColorTheme } from '../components/ColorThemeSelector';
import { COLOR_THEMES } from '../components/ColorThemeSelector';
import type { ThemeMode } from '../components/ThemeSettings';
import { usePersistedState } from '../hooks/usePersistedState';

interface AppContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Use persisted state for all three values
  const [language, setLanguage] = usePersistedState<Language>('language', 'en-US');
  const [colorTheme, setColorTheme] = usePersistedState<ColorTheme>('color-theme', COLOR_THEMES[1]);
  const [themeMode, setThemeMode] = usePersistedState<ThemeMode>('theme-mode', 'system');

  // Apply dark mode based on theme mode
  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (themeMode === 'dark') {
      applyTheme(true);
    } else if (themeMode === 'light') {
      applyTheme(false);
    } else {
      // System mode
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  const value: AppContextType = {
    language,
    setLanguage,
    colorTheme,
    setColorTheme,
    themeMode,
    setThemeMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
