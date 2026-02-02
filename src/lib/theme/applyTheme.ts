/**
 * Theme Application Utilities
 * Applies theme tokens as CSS variables to the document
 */

import {
  colorToCssVar,
  defaultThemeTokens,
  isValidThemeTokens,
  mergeWithDefaults,
  type ThemeColors,
  type ThemeTokens,
} from './tokens';

// =====================================================
// CSS Variable Application
// =====================================================

/**
 * Generate CSS variable string from theme tokens
 * Returns a string of CSS custom properties
 */
export function generateCssVariables(tokens: ThemeTokens): string {
  const lines: string[] = [];

  // Colors
  for (const [key, cssVar] of Object.entries(colorToCssVar)) {
    const colorKey = key as keyof ThemeColors;
    const value = tokens.colors[colorKey];
    if (value) {
      lines.push(`${cssVar}: ${value};`);
    }
  }

  // Radius
  lines.push(`--radius: ${tokens.radius};`);

  // Shadow
  lines.push(`--shadow: ${tokens.shadow};`);

  return lines.join('\n  ');
}

/**
 * Apply theme tokens to document root
 * Call this on the client side to update the theme dynamically
 */
export function applyThemeToDocument(tokens: ThemeTokens): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Apply colors
  for (const [key, cssVar] of Object.entries(colorToCssVar)) {
    const colorKey = key as keyof ThemeColors;
    const value = tokens.colors[colorKey];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  }

  // Apply radius
  root.style.setProperty('--radius', tokens.radius);

  // Apply shadow
  root.style.setProperty('--shadow', tokens.shadow);
}

/**
 * Remove custom theme from document (revert to CSS defaults)
 */
export function removeThemeFromDocument(): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Remove all custom properties
  for (const cssVar of Object.values(colorToCssVar)) {
    root.style.removeProperty(cssVar);
  }

  root.style.removeProperty('--radius');
  root.style.removeProperty('--shadow');
}

/**
 * Get current theme from document CSS variables
 */
export function getThemeFromDocument(): ThemeTokens | null {
  if (typeof document === 'undefined') return null;

  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  const colors: Partial<ThemeColors> = {};

  for (const [key, cssVar] of Object.entries(colorToCssVar)) {
    const value = computedStyle.getPropertyValue(cssVar).trim();
    if (value) {
      colors[key as keyof ThemeColors] = value;
    }
  }

  const radius = computedStyle.getPropertyValue('--radius').trim();
  const shadow = computedStyle.getPropertyValue('--shadow').trim();

  return {
    colors: { ...defaultThemeTokens.colors, ...colors },
    radius: radius || defaultThemeTokens.radius,
    shadow: shadow || defaultThemeTokens.shadow,
  };
}

// =====================================================
// Server-Side Theme Generation
// =====================================================

/**
 * Generate inline style tag content for SSR
 * Use this to inject theme into the HTML head
 */
export function generateThemeStyleTag(tokens: ThemeTokens): string {
  const cssVars = generateCssVariables(tokens);
  return `:root {\n  ${cssVars}\n}`;
}

/**
 * Safe theme parser for data from Supabase
 * Validates and merges with defaults
 */
export function parseThemeFromDatabase(data: unknown): ThemeTokens {
  if (!data || typeof data !== 'object') {
    return defaultThemeTokens;
  }

  const tokens = data as Record<string, unknown>;

  if (isValidThemeTokens(tokens)) {
    return mergeWithDefaults(tokens);
  }

  // Try to extract what we can
  const partialColors = tokens.colors as Record<string, unknown> | undefined;

  return mergeWithDefaults({
    colors: partialColors,
    radius: typeof tokens.radius === 'string' ? tokens.radius : undefined,
    shadow: typeof tokens.shadow === 'string' ? tokens.shadow : undefined,
  });
}
