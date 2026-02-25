/**
 * Seed API Route
 * Initializes the database with default homepage and florist theme
 * POST /api/seed  — seeds homepage + theme
 */

import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import { defaultThemeTokens } from '@/lib/theme/tokens';
import { defaultHomepageBlocks } from '@/lib/defaults/homepage-blocks';
import { defaultAboutBlocks } from '@/lib/defaults/about-blocks';
import { defaultContactBlocks } from '@/lib/defaults/contact-blocks';

type PageInsert = Database['public']['Tables']['pages']['Insert'];
type ThemeInsert = Database['public']['Tables']['theme']['Insert'];

// Use shared default blocks
const defaultBlocks = defaultHomepageBlocks;

// ─── POST Handler ───────────────────────────────────
export async function POST() {
  try {
    const supabase = await createClient();

    const results: { homepage: boolean; theme: boolean } = {
      homepage: false,
      theme: false,
    };

    // ── 1. Seed homepage ────────────────────────────
    const { data: existingHomePage } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', 'anasayfa')
      .maybeSingle();

    if (!existingHomePage) {
      const insertData: PageInsert = {
        title: 'Ana Sayfa',
        slug: 'anasayfa',
        status: 'published',
        blocks: defaultBlocks as PageInsert['blocks'],
        seo: {
          title: 'Bloom Flora - Rize Çiçekçi | Taze Çiçek Teslimatı',
          description: "Rize'nin en taze çiçekleri, özenle hazırlanmış aranjmanlar ve aynı gün teslimat.",
        } as PageInsert['seo'],
      };

      const { error: pageError } = await supabase.from('pages').insert(insertData as never);
      if (pageError) {
        console.error('[Seed] Homepage insert error:', pageError);
      } else {
        results.homepage = true;
      }
    } else {
      // Homepage exists — force update with default blocks
      const homePageId = (existingHomePage as { id: string }).id;
      await supabase
        .from('pages')
        .update({
          blocks: defaultBlocks as PageInsert['blocks'],
          status: 'published' as const,
        } as never)
        .eq('id', homePageId);
      results.homepage = true;
    }

    // ── 2. Seed İletişim page ───────────────────────
    const { data: existingContact } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', 'iletisim')
      .maybeSingle();

    if (!existingContact) {
      const contactData: PageInsert = {
        title: 'İletişim',
        slug: 'iletisim',
        status: 'published',
        blocks: defaultContactBlocks as PageInsert['blocks'],
        seo: {
          title: 'İletişim | Bloom Flora',
          description: 'Bloom Flora ile iletişime geçin. Adres, telefon, e-posta ve sipariş bilgileri.',
        } as PageInsert['seo'],
      };
      const { error: contactError } = await supabase.from('pages').insert(contactData as never);
      if (contactError) console.error('[Seed] Contact page error:', contactError);
    }

    // ── 3. Seed Hakkımızda page ─────────────────────
    const { data: existingAbout } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', 'hakkimizda')
      .maybeSingle();

    if (!existingAbout) {
      const aboutData: PageInsert = {
        title: 'Hakkımızda',
        slug: 'hakkimizda',
        status: 'published',
        blocks: defaultAboutBlocks as PageInsert['blocks'],
        seo: {
          title: 'Hakkımızda | Bloom Flora',
          description: 'Bloom Flora hakkında bilgi edinin. Hikayemiz, değerlerimiz ve ekibimiz.',
        } as PageInsert['seo'],
      };
      const { error: aboutError } = await supabase.from('pages').insert(aboutData as never);
      if (aboutError) console.error('[Seed] About page error:', aboutError);
    }

    // ── 4. Seed theme ───────────────────────────────
    const { data: existingTheme } = await supabase
      .from('theme')
      .select('id')
      .eq('is_active', true)
      .single();

    if (!existingTheme) {
      const themeData: ThemeInsert = {
        name: 'Bloom Flora — Çiçekçi Teması',
        tokens: defaultThemeTokens as ThemeInsert['tokens'],
        is_active: true,
      };

      const { error: themeError } = await supabase.from('theme').insert(themeData as never);
      if (themeError) {
        console.error('[Seed] Theme insert error:', themeError);
      } else {
        results.theme = true;
      }
    } else {
      results.theme = true;
    }

    return NextResponse.json({
      success: true,
      message: 'Varsayılan veriler başarıyla oluşturuldu',
      results,
    });
  } catch (error) {
    console.error('[Seed] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Seed işlemi sırasında hata oluştu' },
      { status: 500 }
    );
  }
}
