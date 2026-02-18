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
      .eq('is_homepage', true)
      .single();

    if (!existingHomePage) {
      const { data: existingSlugPage } = await supabase
        .from('pages')
        .select('id')
        .in('slug', ['home', 'anasayfa', 'ana-sayfa'])
        .limit(1)
        .single();

      if (!existingSlugPage) {
        const insertData: PageInsert = {
          title: 'Ana Sayfa',
          slug: 'anasayfa',
          status: 'published',
          is_homepage: true,
          blocks: defaultBlocks as PageInsert['blocks'],
          seo_title: 'Bloom Flora - Rize Çiçekçi | Taze Çiçek Teslimatı',
          seo_description:
            "Rize'nin en taze çiçekleri, özenle hazırlanmış aranjmanlar ve aynı gün teslimat.",
        };

        const { error: pageError } = await supabase.from('pages').insert(insertData as never);
        if (pageError) {
          console.error('[Seed] Homepage insert error:', pageError);
        } else {
          results.homepage = true;
        }
      } else {
        const slugPageId = (existingSlugPage as { id: string }).id;
        const { error: updateError } = await supabase
          .from('pages')
          .update({
            is_homepage: true,
            blocks: defaultBlocks as PageInsert['blocks'],
            status: 'published' as const,
            seo_title: 'Bloom Flora - Rize Çiçekçi | Taze Çiçek Teslimatı',
            seo_description:
              "Rize'nin en taze çiçekleri, özenle hazırlanmış aranjmanlar ve aynı gün teslimat.",
          } as never)
          .eq('id', slugPageId);

        if (!updateError) results.homepage = true;
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

    // ── 2. Seed theme ───────────────────────────────
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
