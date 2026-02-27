/**
 * Fetch navigation config from site_settings
 * Keys: nav_header, nav_footer
 */

import { createClient } from '@/lib/supabase/server';
import {
  type HeaderConfig,
  type FooterConfig,
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
} from './types';

export async function getNavigationConfig(): Promise<{
  header: HeaderConfig;
  footer: FooterConfig;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['nav_header', 'nav_footer']);

    if (error || !data) {
      return { header: DEFAULT_HEADER_CONFIG, footer: DEFAULT_FOOTER_CONFIG };
    }

    const rows = data as unknown as { key: string; value: unknown }[];

    let header = DEFAULT_HEADER_CONFIG;
    let footer = DEFAULT_FOOTER_CONFIG;

    for (const row of rows) {
      if (row.key === 'nav_header' && row.value && typeof row.value === 'object') {
        header = row.value as HeaderConfig;
      }
      if (row.key === 'nav_footer' && row.value && typeof row.value === 'object') {
        footer = row.value as FooterConfig;
      }
    }

    return { header, footer };
  } catch (err) {
    console.error('[getNavigationConfig] Error:', err);
    return { header: DEFAULT_HEADER_CONFIG, footer: DEFAULT_FOOTER_CONFIG };
  }
}
