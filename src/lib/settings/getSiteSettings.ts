/**
 * Fetch site settings from Supabase site_settings table
 * Returns a typed settings map with fallback defaults
 */

import { createClient } from '@/lib/supabase/server';

export interface SiteSettings {
  site_name: string;
  site_description: string;
  whatsapp_number: string;
  whatsapp_message: string;
  whatsapp_enabled: boolean;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  social_instagram: string;
  social_facebook: string;
  social_twitter: string;
  seo_title: string;
  seo_description: string;
  seo_og_image: string;
}

const DEFAULTS: SiteSettings = {
  site_name: 'BloomFlora',
  site_description: '',
  whatsapp_number: '',
  whatsapp_message: 'Merhaba, bilgi almak istiyorum.',
  whatsapp_enabled: true,
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  social_instagram: '',
  social_facebook: '',
  social_twitter: '',
  seo_title: '',
  seo_description: '',
  seo_og_image: '',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (error || !data) {
      console.error('[getSiteSettings] Error:', error);
      return DEFAULTS;
    }

    const rows = data as unknown as { key: string; value: unknown }[];
    const settings = { ...DEFAULTS };

    for (const row of rows) {
      const key = row.key as keyof SiteSettings;
      if (key in settings) {
        (settings as Record<string, unknown>)[key] = row.value;
      }
    }

    return settings;
  } catch (err) {
    console.error('[getSiteSettings] Unexpected error:', err);
    return DEFAULTS;
  }
}
