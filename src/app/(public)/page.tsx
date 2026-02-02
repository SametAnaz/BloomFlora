/**
 * Home Page
 * Dynamic page rendered from Supabase blocks
 */

import { PageRenderer, initializeModules } from '@/modules';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

import type { BlockInstance } from '@/modules/types';

type PageRow = Database['public']['Tables']['pages']['Row'];

// Ensure modules are initialized
initializeModules();

// Sample blocks for demo (will be replaced with Supabase data)
const demoBlocks: BlockInstance[] = [
  {
    id: '1',
    type: 'hero.v1',
    order: 0,
    enabled: true,
    config: {
      title: 'Bloom Flora',
      subtitle: 'Rize\'nin en taze çiçekleri ve özenle hazırlanmış aranjmanları ile özel günlerinizi unutulmaz kılın.',
      alignment: 'center',
      primaryCta: {
        text: 'Ürünleri Keşfet',
        href: '/urunler',
        variant: 'primary',
      },
      secondaryCta: {
        text: 'İletişime Geç',
        href: '/iletisim',
        variant: 'outline',
      },
      background: {
        type: 'color',
        color: 'oklch(0.95 0.02 340)',
      },
      height: 'medium',
      textColor: 'dark',
    },
  },
  {
    id: '2',
    type: 'richText.v1',
    order: 1,
    enabled: true,
    config: {
      content: `
        <h2>Hakkımızda</h2>
        <p>Bloom Flora olarak, Rize'nin kalbinde taze çiçekler, özenle hazırlanmış aranjmanlar ve dekoratif süs eşyaları sunuyoruz.</p>
        <p>Her bir ürünümüz, sevdiklerinize olan sevginizi en güzel şekilde ifade etmeniz için özenle seçilip hazırlanmaktadır.</p>
      `,
      maxWidth: 'lg',
      alignment: 'center',
      textSize: 'base',
    },
  },
  {
    id: '3',
    type: 'contactForm.v1',
    order: 2,
    enabled: true,
    config: {
      title: 'Bize Ulaşın',
      subtitle: 'Sorularınız veya özel siparişleriniz için bizimle iletişime geçebilirsiniz.',
      showName: true,
      showPhone: true,
      showSubject: false,
      submitText: 'Mesaj Gönder',
      successMessage: 'Mesajınız başarıyla gönderildi! En kısa sürede dönüş yapacağız.',
      layout: 'stacked',
    },
  },
];

export default async function HomePage() {
  // Try to fetch home page blocks from Supabase
  let blocks: BlockInstance[] = demoBlocks;

  try {
    const supabase = await createClient();
    let pageData: PageRow | null = null;
    
    // First try to get the home page - by is_homepage flag
    const { data: homePage } = await supabase
      .from('pages')
      .select('*')
      .eq('is_homepage', true)
      .single();

    if (homePage) {
      pageData = homePage as PageRow;
    } else {
      // Fallback to common homepage slugs if no homepage flag set
      const { data: slugPage } = await supabase
        .from('pages')
        .select('*')
        .in('slug', ['home', 'anasayfa', 'ana-sayfa'])
        .limit(1)
        .single();
      
      if (slugPage) {
        pageData = slugPage as PageRow;
      }
    }
    
    console.log('[HomePage] Fetched page:', pageData?.slug, 'blocks count:', pageData?.blocks?.length);
    
    if (pageData) {
      // Check if blocks exist and are valid
      if (pageData.blocks && Array.isArray(pageData.blocks) && pageData.blocks.length > 0) {
        blocks = pageData.blocks as BlockInstance[];
        console.log('[HomePage] Using database blocks:', blocks.length);
      } else {
        console.log('[HomePage] No blocks in database, using demo');
      }
    } else {
      console.log('[HomePage] No page found, using demo blocks');
    }
  } catch (err) {
    console.error('[HomePage] Error fetching page:', err);
    // Use demo blocks if fetch fails
  }

  return <PageRenderer blocks={blocks} />;
}
