import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Visual theme types (Classic vs Warm Minimal)
// Note: This is different from ColorTheme in ColorThemeSelector (Eastern/Western price colors)
export type VisualTheme = 'classic' | 'warm';

interface VisualThemeContextType {
  visualTheme: VisualTheme;
  setVisualTheme: (theme: VisualTheme) => void;
}

const VisualThemeContext = createContext<VisualThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'marketvue_visual_theme';
const DEFAULT_THEME: VisualTheme = 'classic';

interface VisualThemeProviderProps {
  children: ReactNode;
}

export function VisualThemeProvider({ children }: VisualThemeProviderProps) {
  const [visualTheme, setVisualThemeState] = useState<VisualTheme>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'classic' || stored === 'warm') {
        return stored;
      }
    } catch (error) {
      console.error('Failed to load visual theme from localStorage:', error);
    }
    return DEFAULT_THEME;
  });

  // Persist to localStorage whenever theme changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, visualTheme);
    } catch (error) {
      console.error('Failed to save visual theme to localStorage:', error);
    }
  }, [visualTheme]);

  const setVisualTheme = (theme: VisualTheme) => {
    setVisualThemeState(theme);
  };

  return (
    <VisualThemeContext.Provider value={{ visualTheme, setVisualTheme }}>
      {children}
    </VisualThemeContext.Provider>
  );
}

// Custom hook to use visual theme
export function useVisualTheme() {
  const context = useContext(VisualThemeContext);
  if (context === undefined) {
    throw new Error('useVisualTheme must be used within a VisualThemeProvider');
  }
  return context;
}
