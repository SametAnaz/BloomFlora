'use client';

/**
 * Theme Provider Component
 * Client-side context for dynamic theme management
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { applyThemeToDocument, removeThemeFromDocument } from './applyTheme';
import { defaultThemeTokens, type ThemeTokens } from './tokens';

// =====================================================
// Context Types
// =====================================================

interface ThemeContextValue {
  theme: ThemeTokens;
  setTheme: (tokens: ThemeTokens) => void;
  resetTheme: () => void;
  isLoading: boolean;
}

// =====================================================
// Context
// =====================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

// =====================================================
// Provider Props
// =====================================================

interface ThemeProviderProps {
  children: ReactNode;
  /** Initial theme from server (SSR) */
  initialTheme?: ThemeTokens;
}

// =====================================================
// Provider Component
// =====================================================

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeTokens>(
    initialTheme || defaultThemeTokens
  );
  const [isLoading, setIsLoading] = useState(false);

  // Apply theme to document when it changes
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  // Set theme handler
  const setTheme = useCallback((tokens: ThemeTokens) => {
    setIsLoading(true);
    setThemeState(tokens);
    setIsLoading(false);
  }, []);

  // Reset to default theme
  const resetTheme = useCallback(() => {
    removeThemeFromDocument();
    setThemeState(defaultThemeTokens);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

// =====================================================
// Hook
// =====================================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// =====================================================
// Server Component Helper
// Generate inline styles for SSR
// =====================================================

export function generateThemeScript(tokens: ThemeTokens): string {
  // Generate a script that applies theme immediately to prevent flash
  const colorsJson = JSON.stringify(tokens.colors);
  const radius = tokens.radius;
  const shadow = tokens.shadow;

  return `
    (function() {
      var colors = ${colorsJson};
      var root = document.documentElement;
      var colorMap = {
        primary: '--primary',
        primaryForeground: '--primary-foreground',
        secondary: '--secondary',
        secondaryForeground: '--secondary-foreground',
        background: '--background',
        foreground: '--foreground',
        muted: '--muted',
        mutedForeground: '--muted-foreground',
        accent: '--accent',
        accentForeground: '--accent-foreground',
        destructive: '--destructive',
        border: '--border',
        input: '--input',
        ring: '--ring',
        card: '--card',
        cardForeground: '--card-foreground',
        popover: '--popover',
        popoverForeground: '--popover-foreground'
      };
      for (var key in colors) {
        if (colorMap[key]) {
          root.style.setProperty(colorMap[key], colors[key]);
        }
      }
      root.style.setProperty('--radius', '${radius}');
      root.style.setProperty('--shadow', '${shadow}');
    })();
  `.trim();
}
