/**
 * Theme Token System for BloomFlora
 * Defines the structure and defaults for dynamic theming
 */

// =====================================================
// Token Interfaces
// =====================================================

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  // Card
  card: string;
  cardForeground: string;
  // Popover
  popover: string;
  popoverForeground: string;
}

export interface ThemeTokens {
  colors: ThemeColors;
  radius: string;
  shadow: string;
}

// =====================================================
// Default Theme Values
// =====================================================

export const defaultColors: ThemeColors = {
  // Primary - Rose pink on dark burgundy
  primary: '#D4919A',
  primaryForeground: '#2A0F17',
  // Secondary - Mid burgundy
  secondary: '#5E2A38',
  secondaryForeground: '#F2D4D7',
  // Background & Foreground - Dark wine
  background: '#2A1118',
  foreground: '#F5E6E8',
  // Muted - Core burgundy (#4D1D2A)
  muted: '#4D1D2A',
  mutedForeground: '#C4959E',
  // Accent - Deep rose
  accent: '#6B2D3D',
  accentForeground: '#F5E6E8',
  // Destructive
  destructive: '#F87171',
  // Borders & Input
  border: '#6B2D3D',
  input: '#5E2A38',
  ring: '#D4919A',
  // Card - Darker burgundy
  card: '#3D1925',
  cardForeground: '#F5E6E8',
  // Popover
  popover: '#3D1925',
  popoverForeground: '#F5E6E8',
};

export const defaultThemeTokens: ThemeTokens = {
  colors: defaultColors,
  radius: '0.75rem',
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
};

// =====================================================
// CSS Variable Mapping
// Maps token keys to CSS variable names
// =====================================================

export const colorToCssVar: Record<keyof ThemeColors, string> = {
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
  popoverForeground: '--popover-foreground',
};

// =====================================================
// Utility Functions
// =====================================================

/**
 * Convert hex color to OKLCH format for Tailwind v4
 * For simplicity, we'll use hex directly in CSS variables
 * The actual conversion can be added later if needed
 */
export function hexToOklch(hex: string): string {
  // For now, return hex as-is
  // Tailwind v4 can work with hex colors
  return hex;
}

/**
 * Validate theme tokens structure
 */
export function isValidThemeTokens(tokens: unknown): tokens is ThemeTokens {
  if (!tokens || typeof tokens !== 'object') return false;

  const t = tokens as Record<string, unknown>;

  if (!t.colors || typeof t.colors !== 'object') return false;
  if (typeof t.radius !== 'string') return false;

  return true;
}

/**
 * Input type for mergeWithDefaults - accepts partial or unknown data
 */
export interface PartialThemeInput {
  colors?: Partial<ThemeColors> | Record<string, unknown>;
  radius?: string;
  shadow?: string;
}

/**
 * Merge partial theme with defaults
 * Accepts unknown color objects for flexible parsing from database
 */
export function mergeWithDefaults(partial: PartialThemeInput): ThemeTokens {
  const mergedColors = { ...defaultColors };

  if (partial.colors && typeof partial.colors === 'object') {
    for (const key of Object.keys(defaultColors)) {
      const value = (partial.colors as Record<string, unknown>)[key];
      if (typeof value === 'string') {
        mergedColors[key as keyof ThemeColors] = value;
      }
    }
  }

  return {
    colors: mergedColors,
    radius: partial.radius || defaultThemeTokens.radius,
    shadow: partial.shadow || defaultThemeTokens.shadow,
  };
}
