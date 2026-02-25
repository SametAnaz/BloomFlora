/**
 * Default "Hakkımızda" (About) Page Blocks
 * Used when loading defaults for the about page
 */

import type { BlockConfig } from '@/lib/supabase/types';

export const defaultAboutBlocks: BlockConfig[] = [
  // ─── Hero ───────────────────────────────────────
  {
    id: 'about-hero',
    type: 'hero.v1',
    order: 0,
    enabled: true,
    config: {
      title: 'Hakkımızda',
      subtitle:
        'Bloom Flora olarak, çiçeğin dilinden anlayanlara en taze ve en özel aranjmanları sunuyoruz.',
      alignment: 'center',
      titleStyle: { fontSize: '5xl', fontWeight: 'bold' },
      subtitleStyle: { fontSize: 'xl', fontWeight: 'normal' },
      buttons: [],
      background: {
        type: 'gradient',
        gradient:
          'linear-gradient(135deg, #4D1D2A 0%, #3D1925 40%, #5E2A38 70%, #6B2D3D 100%)',
        overlayOpacity: 0,
      },
      height: 'medium',
      textColor: 'light',
    },
  },

  // ─── Hikayemiz ──────────────────────────────────
  {
    id: 'about-story',
    type: 'richText.v1',
    order: 1,
    enabled: true,
    config: {
      content: `<h2>Hikayemiz</h2>
<p>Bloom Flora, çiçeğe ve doğaya olan tutkumuzdan doğdu. Rize'nin yeşil doğası arasında, her mevsimin renklerini sizlere ulaştırmak amacıyla yola çıktık.</p>
<p>Amacımız sadece çiçek satmak değil; her bukette bir duygu, her aranjmanda bir hikaye anlatmak. Doğum günlerinden yıl dönümlerine, taziye çelenklerinden kutlama buketlerine kadar her özel anınızda yanınızdayız.</p>
<p>Profesyonel ekibimiz, en taze çiçekleri özenle seçerek sizin için benzersiz tasarımlar oluşturur.</p>`,
      maxWidth: 'prose',
      alignment: 'center',
      background: {
        type: 'solid',
        color: '#FFFFFF',
      },
    },
  },

  // ─── Değerlerimiz ───────────────────────────────
  {
    id: 'about-values',
    type: 'features.v1',
    order: 2,
    enabled: true,
    config: {
      title: 'Değerlerimiz',
      subtitle: 'Bizi biz yapan ilkeler',
      features: [
        {
          icon: 'Heart',
          title: 'Tutku',
          description:
            'İşimizi seviyoruz. Her çiçeğe özenle dokunuyor, her tasarıma kalbimizi koyuyoruz.',
        },
        {
          icon: 'Leaf',
          title: 'Tazelik',
          description:
            'Çiçeklerimiz her gün taze olarak temin edilir, kalite kontrolden geçirilir.',
        },
        {
          icon: 'Users',
          title: 'Müşteri Memnuniyeti',
          description:
            'Sizin mutluluğunuz bizim önceliğimiz. Her siparişte %100 memnuniyet garantisi.',
        },
        {
          icon: 'Star',
          title: 'Kalite',
          description:
            'En kaliteli çiçekleri, en uygun fiyatlarla sunmak temel prensiplerimizden.',
        },
      ],
      columns: 4,
      background: {
        type: 'solid',
        color: '#FDF8F8',
      },
    },
  },

  // ─── İstatistikler ──────────────────────────────
  {
    id: 'about-stats',
    type: 'stats.v1',
    order: 3,
    enabled: true,
    config: {
      title: 'Rakamlarla Bloom Flora',
      stats: [
        { value: '1000+', label: 'Mutlu Müşteri' },
        { value: '5000+', label: 'Teslimat' },
        { value: '50+', label: 'Ürün Çeşidi' },
        { value: '7/24', label: 'Sipariş' },
      ],
      background: {
        type: 'gradient',
        gradient:
          'linear-gradient(135deg, #4D1D2A 0%, #6B2D3D 100%)',
      },
      textColor: 'light',
    },
  },

  // ─── CTA ────────────────────────────────────────
  {
    id: 'about-cta',
    type: 'cta.v1',
    order: 4,
    enabled: true,
    config: {
      title: 'Bizimle İletişime Geçin',
      description:
        'Sorularınız mı var? Özel sipariş mi vermek istiyorsunuz? Bize ulaşın, size yardımcı olalım.',
      primaryButtonText: 'İletişim',
      primaryButtonLink: '/iletisim',
      secondaryButtonText: 'Ürünleri Keşfet',
      secondaryButtonLink: '/urunler',
      style: 'simple',
      alignment: 'center',
    },
  },
];
