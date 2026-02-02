/**
 * Theme Module Exports
 */

// Token definitions and types
export {
  colorToCssVar,
  defaultColors,
  defaultThemeTokens,
  hexToOklch,
  isValidThemeTokens,
  mergeWithDefaults,
  type ThemeColors,
  type ThemeTokens,
} from './tokens';

// Apply utilities
export {
  applyThemeToDocument,
  generateCssVariables,
  generateThemeStyleTag,
  getThemeFromDocument,
  parseThemeFromDatabase,
  removeThemeFromDocument,
} from './applyTheme';

// Server-side data fetching
export { getActiveTheme, getAllThemes, getThemeById } from './getTheme';

// Client-side provider
export {
  generateThemeScript,
  ThemeProvider,
  useTheme,
} from './ThemeProvider';
