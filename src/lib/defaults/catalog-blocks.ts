/**
 * Default Catalog Page Blocks
 * Used for the Katalog page in the page builder
 */

import type { BlockConfig } from '@/lib/supabase/types';

export const defaultCatalogBlocks: BlockConfig[] = [
  {
    id: 'catalog-hero',
    type: 'hero.v1',
    order: 0,
    enabled: true,
    config: {
      title: 'Ürünlerimiz',
      subtitle:
        'Her özel anınız için özenle hazırlanmış çiçek aranjmanları ve buketler',
      alignment: 'center',
      titleStyle: { fontSize: '5xl', fontWeight: 'bold' },
      subtitleStyle: { fontSize: 'xl', fontWeight: 'normal' },
      buttons: [
        {
          id: 'btn-catalog',
          text: 'Kataloğu Keşfet',
          href: '/urunler',
          variant: 'primary',
        },
      ],
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
  {
    id: 'catalog-cta',
    type: 'cta.v1',
    order: 1,
    enabled: true,
    config: {
      title: 'Özel Sipariş mi Vermek İstiyorsunuz?',
      description:
        'Hayalinizdeki çiçek aranjmanını bize anlatın, sizin için özel olarak hazırlayalım.',
      buttons: [
        {
          id: 'cta-btn-1',
          text: 'WhatsApp ile İletişim',
          href: 'https://wa.me/905551234567',
          variant: 'primary',
        },
        {
          id: 'cta-btn-2',
          text: 'Bizi Arayın',
          href: 'tel:+905551234567',
          variant: 'outline',
        },
      ],
      background: {
        type: 'color',
        color: '#FDF6F0',
        overlayOpacity: 0,
      },
    },
  },
];
