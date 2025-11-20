import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Language } from '../i18n/translations';
import type { ColorTheme } from '../components/ColorThemeSelector';
import { COLOR_THEMES } from '../components/ColorThemeSelector';
import type { ThemeMode } from '../components/ThemeSettings';

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
  const [language, setLanguageState] = useState<Language>('en-US');
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(COLOR_THEMES[1]); // Western style
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      try {
        setLanguageState(savedLanguage as Language);
      } catch (e) {
        console.error('Failed to load saved language:', e);
      }
    }

    const savedColorTheme = localStorage.getItem('color-theme');
    if (savedColorTheme) {
      try {
        setColorThemeState(JSON.parse(savedColorTheme));
      } catch (e) {
        console.error('Failed to load saved color theme:', e);
      }
    }

    const savedThemeMode = localStorage.getItem('theme-mode');
    if (savedThemeMode) {
      try {
        setThemeModeState(savedThemeMode as ThemeMode);
      } catch (e) {
        console.error('Failed to load saved theme mode:', e);
      }
    }

    setIsInitialized(true);
  }, []);

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

  // Save to localStorage with wrapper functions
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (isInitialized) {
      localStorage.setItem('language', lang);
    }
  };

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    if (isInitialized) {
      localStorage.setItem('color-theme', JSON.stringify(theme));
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (isInitialized) {
      localStorage.setItem('theme-mode', mode);
    }
  };

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
