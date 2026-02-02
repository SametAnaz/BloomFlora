/**
 * Theme Data Access Functions
 * Server-side functions for fetching theme from Supabase
 */

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

import { parseThemeFromDatabase } from './applyTheme';
import { defaultThemeTokens, type ThemeTokens } from './tokens';

// Type alias for theme row
type ThemeRow = Database['public']['Tables']['theme']['Row'];

// =====================================================
// Server-Side Theme Fetching
// =====================================================

/**
 * Fetch the active theme from Supabase
 * Use this in Server Components or Server Actions
 */
export async function getActiveTheme(): Promise<ThemeTokens> {
  // Skip during build time (no cookies available)
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    // Check if we're in a request context by trying to access headers
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('theme')
        .select('tokens')
        .eq('is_active', true)
        .single();

      if (error) {
        // Silently return default theme on error (don't log during build)
        return defaultThemeTokens;
      }

      const themeData = data as Pick<ThemeRow, 'tokens'> | null;

      if (!themeData?.tokens) {
        return defaultThemeTokens;
      }

      return parseThemeFromDatabase(themeData.tokens);
    } catch {
      // Return default theme if cookies not available (build time)
      return defaultThemeTokens;
    }
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('theme')
      .select('tokens')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching active theme:', error.message);
      return defaultThemeTokens;
    }

    const themeData = data as Pick<ThemeRow, 'tokens'> | null;

    if (!themeData?.tokens) {
      return defaultThemeTokens;
    }

    return parseThemeFromDatabase(themeData.tokens);
  } catch (error) {
    console.error('Failed to fetch theme:', error);
    return defaultThemeTokens;
  }
}

/**
 * Fetch all themes from Supabase
 * Use this in admin panel for theme management
 */
export async function getAllThemes(): Promise<
  Array<{
    id: string;
    name: string;
    tokens: ThemeTokens;
    is_active: boolean;
  }>
> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('theme')
      .select('id, name, tokens, is_active')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching themes:', error.message);
      return [];
    }

    const themes = data as Pick<ThemeRow, 'id' | 'name' | 'tokens' | 'is_active'>[] | null;

    return (themes || []).map((theme) => ({
      id: theme.id,
      name: theme.name,
      tokens: parseThemeFromDatabase(theme.tokens),
      is_active: theme.is_active,
    }));
  } catch (error) {
    console.error('Failed to fetch themes:', error);
    return [];
  }
}

/**
 * Fetch a specific theme by ID
 */
export async function getThemeById(
  id: string
): Promise<{ id: string; name: string; tokens: ThemeTokens } | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('theme')
      .select('id, name, tokens')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    const themeData = data as Pick<ThemeRow, 'id' | 'name' | 'tokens'>;

    return {
      id: themeData.id,
      name: themeData.name,
      tokens: parseThemeFromDatabase(themeData.tokens),
    };
  } catch (error) {
    console.error('Failed to fetch theme:', error);
    return null;
  }
}
