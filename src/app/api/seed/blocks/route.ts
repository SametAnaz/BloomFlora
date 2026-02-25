/**
 * Load Default Blocks API
 * POST /api/seed/blocks — force-loads default blocks into a given page
 */

import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { defaultHomepageBlocks } from '@/lib/defaults/homepage-blocks';
import { defaultCatalogBlocks } from '@/lib/defaults/catalog-blocks';
import { defaultAboutBlocks } from '@/lib/defaults/about-blocks';
import { defaultContactBlocks } from '@/lib/defaults/contact-blocks';

export async function POST(request: Request) {
  try {
    const { pageId } = (await request.json()) as { pageId?: string };

    if (!pageId) {
      return NextResponse.json(
        { success: false, message: 'pageId gerekli' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch the page to determine which defaults to use
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('slug')
      .eq('id', pageId)
      .single() as unknown as { data: { slug: string } | null; error: unknown };

    console.log('[Seed Blocks] pageId:', pageId, 'slug:', page?.slug, 'error:', pageError);

    // Choose default blocks based on page slug
    let blocks = defaultHomepageBlocks;
    if (page) {
      if (page.slug === 'anasayfa') {
        blocks = defaultHomepageBlocks;
      } else if (page.slug === 'katalog' || page.slug === 'urunler') {
        blocks = defaultCatalogBlocks;
      } else if (page.slug === 'hakkimizda') {
        blocks = defaultAboutBlocks;
      } else if (page.slug === 'iletisim') {
        blocks = defaultContactBlocks;
      } else {
        // Generic default for other pages: hero + richText + CTA
        blocks = [
          {
            id: `${page.slug}-hero`,
            type: 'hero.v1',
            order: 0,
            enabled: true,
            config: {
              title: page.slug.charAt(0).toUpperCase() + page.slug.slice(1).replace(/-/g, ' '),
              subtitle: '',
              alignment: 'center',
              buttons: [],
              background: {
                type: 'gradient',
                gradient: 'linear-gradient(135deg, #4D1D2A 0%, #6B2D3D 100%)',
                overlayOpacity: 0,
              },
              height: 'medium',
              textColor: 'light',
            },
          },
          {
            id: `${page.slug}-content`,
            type: 'richText.v1',
            order: 1,
            enabled: true,
            config: {
              content: '<h2>İçerik</h2><p>Bu sayfanın içeriğini buradan düzenleyebilirsiniz.</p>',
              maxWidth: 'prose',
              alignment: 'center',
            },
          },
          {
            id: `${page.slug}-cta`,
            type: 'cta.v1',
            order: 2,
            enabled: true,
            config: {
              title: 'Bizimle İletişime Geçin',
              description: 'Sorularınız için bize ulaşın.',
              primaryButtonText: 'İletişim',
              primaryButtonLink: '/iletisim',
              style: 'simple',
              alignment: 'center',
            },
          },
        ];
      }
    }

    const { error } = await supabase
      .from('pages')
      .update({
        blocks: blocks as never,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', pageId);

    if (error) {
      console.error('[Seed Blocks] Error:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blocks,
    });
  } catch (error) {
    console.error('[Seed Blocks] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
