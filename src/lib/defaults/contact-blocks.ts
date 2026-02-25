/**
 * Default "İletişim" (Contact) Page Blocks
 * Used when loading defaults for the contact page
 */

import type { BlockConfig } from '@/lib/supabase/types';

export const defaultContactBlocks: BlockConfig[] = [
  // ─── Hero ───────────────────────────────────────
  {
    id: 'contact-hero',
    type: 'hero.v1',
    order: 0,
    enabled: true,
    config: {
      title: 'İletişim',
      subtitle: 'Sorularınız, önerileriniz veya sipariş talepleriniz için bize ulaşın.',
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

  // ─── İletişim Bilgileri ─────────────────────────
  {
    id: 'contact-info',
    type: 'features.v1',
    order: 1,
    enabled: true,
    config: {
      title: 'Bize Ulaşın',
      subtitle: 'Size yardımcı olmaktan mutluluk duyarız',
      features: [
        {
          icon: 'MapPin',
          title: 'Adres',
          description: 'Müftü Mahallesi, Stadyum Sokak No: 32/A, Rize',
        },
        {
          icon: 'Phone',
          title: 'Telefon',
          description: 'Site ayarlarından güncelleyin',
        },
        {
          icon: 'Mail',
          title: 'E-posta',
          description: 'Site ayarlarından güncelleyin',
        },
        {
          icon: 'Clock',
          title: 'Çalışma Saatleri',
          description: 'Pazartesi - Cumartesi: 09:00 - 19:00',
        },
      ],
      columns: 4,
      background: {
        type: 'solid',
        color: '#FFFFFF',
      },
    },
  },

  // ─── İletişim Formu ─────────────────────────────
  {
    id: 'contact-form',
    type: 'contactForm.v1',
    order: 2,
    enabled: true,
    config: {
      title: 'Mesaj Gönderin',
      subtitle: 'Formu doldurun, en kısa sürede size dönüş yapalım.',
      recipientEmail: '',
      fields: ['name', 'email', 'phone', 'message'],
      submitText: 'Gönder',
      successMessage: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      background: {
        type: 'solid',
        color: '#FDF8F8',
      },
    },
  },

  // ─── Harita (Zengin Metin ile iframe) ───────────
  {
    id: 'contact-map',
    type: 'richText.v1',
    order: 3,
    enabled: true,
    config: {
      content: `<h2 style="text-align:center">Konumumuz</h2>
<div style="display:flex;justify-content:center;margin-top:1rem">
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3002.5!2d40.5234!3d41.0205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAxJzEzLjgiTiA0MMKwMzEnMjQuNCJF!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str" width="100%" height="400" style="border:0;border-radius:12px;max-width:900px" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
</div>`,
      maxWidth: 'full',
      alignment: 'center',
      background: {
        type: 'solid',
        color: '#FFFFFF',
      },
    },
  },

  // ─── CTA ────────────────────────────────────────
  {
    id: 'contact-cta',
    type: 'cta.v1',
    order: 4,
    enabled: true,
    config: {
      title: 'Hemen WhatsApp ile Ulaşın',
      description: 'Hızlı sipariş ve sorularınız için WhatsApp üzerinden de bize yazabilirsiniz.',
      primaryButtonText: 'WhatsApp ile Yaz',
      primaryButtonLink: 'https://wa.me/',
      secondaryButtonText: 'Ürünleri Keşfet',
      secondaryButtonLink: '/urunler',
      style: 'gradient',
      alignment: 'center',
    },
  },
];
