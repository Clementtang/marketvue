import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { usePersistedState } from "../hooks/usePersistedState";

// Visual theme types (Classic vs Warm Minimal)
// Note: This is different from ColorTheme in ColorThemeSelector (Eastern/Western price colors)
export type VisualTheme = "classic" | "warm";

interface VisualThemeContextType {
  visualTheme: VisualTheme;
  setVisualTheme: (theme: VisualTheme) => void;
}

const VisualThemeContext = createContext<VisualThemeContextType | undefined>(
  undefined,
);

interface VisualThemeProviderProps {
  children: ReactNode;
}

export function VisualThemeProvider({ children }: VisualThemeProviderProps) {
  const [visualTheme, setVisualTheme] = usePersistedState<VisualTheme>(
    "marketvue_visual_theme",
    "classic",
  );

  return (
    <VisualThemeContext.Provider value={{ visualTheme, setVisualTheme }}>
      {children}
    </VisualThemeContext.Provider>
  );
}

// Custom hook to use visual theme
// eslint-disable-next-line react-refresh/only-export-components
export function useVisualTheme() {
  const context = useContext(VisualThemeContext);
  if (context === undefined) {
    throw new Error("useVisualTheme must be used within a VisualThemeProvider");
  }
  return context;
}
