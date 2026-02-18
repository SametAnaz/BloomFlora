/**
 * Default Homepage Blocks
 * Shared between seed route, public page fallback, and admin page builder
 */

import type { BlockConfig } from '@/lib/supabase/types';

export const defaultHomepageBlocks: BlockConfig[] = [
  {
    id: 'default-hero',
    type: 'hero.v1',
    order: 0,
    enabled: true,
    config: {
      title: 'Bloom Flora',
      subtitle:
        "Rize'nin en taze çiçekleri ve özenle hazırlanmış aranjmanları ile özel günlerinizi unutulmaz kılın.",
      alignment: 'center',
      primaryCta: {
        text: 'Ürünleri Keşfet',
        href: '/urunler',
        variant: 'primary',
      },
      secondaryCta: {
        text: 'İletişime Geç',
        href: '#iletisim',
        variant: 'outline',
      },
      background: {
        type: 'gradient',
        gradient:
          'linear-gradient(135deg, #4D1D2A 0%, #3D1925 40%, #5E2A38 70%, #6B2D3D 100%)',
        overlayOpacity: 0,
      },
      height: 'large',
      textColor: 'light',
    },
  },
  {
    id: 'default-features',
    type: 'features.v1',
    order: 1,
    enabled: true,
    config: {
      title: 'Neden Bloom Flora?',
      subtitle: 'Her çiçeğin bir hikayesi var — biz onu sizinle buluşturuyoruz',
      features: [
        {
          icon: 'Truck',
          title: 'Aynı Gün Teslimat',
          description:
            "Rize merkez ve ilçelerine aynı gün içinde taze çiçek teslimatı yapıyoruz.",
        },
        {
          icon: 'Heart',
          title: 'El Yapımı Aranjmanlar',
          description:
            'Her buket profesyonel çiçek tasarımcılarımız tarafından özenle hazırlanır.',
        },
        {
          icon: 'Gift',
          title: 'Özel Gün Paketleri',
          description:
            'Doğum günü, yıl dönümü, sevgililer günü ve daha fazlası için hazır paketler.',
        },
        {
          icon: 'Clock',
          title: 'Taze Çiçek Garantisi',
          description:
            'Tüm çiçeklerimiz günlük taze kesimdir. 7 gün tazelik garantisi veriyoruz.',
        },
      ],
      columns: '4',
      iconStyle: 'circle',
      alignment: 'center',
    },
  },
  {
    id: 'default-about',
    type: 'richText.v1',
    order: 2,
    enabled: true,
    config: {
      content:
        '<h2>Hakkımızda</h2><p>Bloom Flora olarak <strong>Rize\'nin kalbinde</strong> 2010 yılından bu yana hizmet veriyoruz. Taze çiçekler, özenle hazırlanmış aranjmanlar, gelin buketleri ve dekoratif süs bitkileri sunuyoruz.</p><p>Her bir ürünümüz, sevdiklerinize olan sevginizi en güzel şekilde ifade etmeniz için <em>özenle seçilip hazırlanmaktadır</em>. Doğanın en güzel renklerini, en taze kokularıyla kapınıza getiriyoruz.</p>',
      maxWidth: 'lg',
      alignment: 'center',
      textSize: 'lg',
    },
  },
  {
    id: 'default-stats',
    type: 'stats.v1',
    order: 3,
    enabled: true,
    config: {
      title: '',
      subtitle: '',
      stats: [
        { value: '15000', label: 'Mutlu Müşteri', suffix: '+' },
        { value: '500', label: 'Çiçek Çeşidi', suffix: '+' },
        { value: '15', label: 'Yıllık Deneyim', suffix: ' Yıl' },
        { value: '4.9', label: 'Müşteri Puanı', suffix: '/5' },
      ],
      layout: 'row',
      variant: 'cards',
      background: 'primary',
    },
  },
  {
    id: 'default-divider-1',
    type: 'divider.v1',
    order: 4,
    enabled: true,
    config: {
      style: 'icon',
      icon: '🌸',
      thickness: 'thin',
      width: '1/2',
      color: 'primary',
      spacing: 'lg',
    },
  },
  {
    id: 'default-gallery',
    type: 'imageGallery.v1',
    order: 5,
    enabled: true,
    config: {
      title: 'Çalışmalarımız',
      images: [
        {
          src: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=600&fit=crop',
          alt: 'Pembe gül buketi',
        },
        {
          src: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&h=600&fit=crop',
          alt: 'Kır çiçekleri aranjmanı',
        },
        {
          src: 'https://images.unsplash.com/photo-1561584260-440eba40f00d?w=600&h=600&fit=crop',
          alt: 'Beyaz lilyum buketi',
        },
        {
          src: 'https://images.unsplash.com/photo-1494336956603-39a3f0e3c42e?w=600&h=600&fit=crop',
          alt: 'Renkli lale aranjmanı',
        },
        {
          src: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&h=600&fit=crop',
          alt: 'Gelin çiçeği',
        },
        {
          src: 'https://images.unsplash.com/photo-1469259943454-aa100abba749?w=600&h=600&fit=crop',
          alt: 'Orkide aranjmanı',
        },
      ],
      columns: '3',
      aspectRatio: 'square',
      gap: 'md',
      lightbox: true,
    },
  },
  {
    id: 'default-testimonials',
    type: 'testimonials.v1',
    order: 6,
    enabled: true,
    config: {
      title: 'Müşterilerimiz Ne Diyor?',
      subtitle: 'Bloom Flora farkını onlardan dinleyin',
      testimonials: [
        {
          name: 'Ayşe Yılmaz',
          role: 'Düzenli Müşteri',
          content:
            'Anneme her hafta çiçek gönderiyorum. Her seferinde harika aranjmanlar hazırlıyorlar, annem çok mutlu oluyor!',
          rating: 5,
        },
        {
          name: 'Mehmet Kaya',
          role: 'Düğün Organizasyonu',
          content:
            'Düğünümüzün tüm çiçek dekorasyonunu Bloom Flora yaptı. Hayalimizdeki düğünü gerçeğe dönüştürdüler.',
          rating: 5,
        },
        {
          name: 'Zeynep Demir',
          role: 'Kurumsal Müşteri',
          content:
            "Ofisimiz için her hafta taze çiçek siparişi veriyoruz. Zamanında teslimat ve hep taze çiçekler. Teşekkürler!",
          rating: 5,
        },
      ],
      layout: 'grid',
      showRating: true,
      showAvatar: true,
      columns: '3',
    },
  },
  {
    id: 'default-cta',
    type: 'cta.v1',
    order: 7,
    enabled: true,
    config: {
      title: 'Sevdiklerinize Çiçek Gönderin 💐',
      description:
        "Özel günlerde ya da sebepsiz yere... En taze çiçeklerle sevginizi gösterin. Rize'ye aynı gün teslimat!",
      primaryButtonText: 'Hemen Sipariş Ver',
      primaryButtonLink: '/urunler',
      secondaryButtonText: 'WhatsApp ile Sipariş',
      secondaryButtonLink: 'https://wa.me/905551234567',
      style: 'gradient',
      alignment: 'center',
    },
  },
  {
    id: 'default-faq',
    type: 'faq.v1',
    order: 8,
    enabled: true,
    config: {
      title: 'Sıkça Sorulan Sorular',
      subtitle: 'Merak ettiğiniz her şeyin cevabı burada',
      items: [
        {
          question: 'Aynı gün teslimat yapıyor musunuz?',
          answer:
            "Evet! Rize merkez ve yakın ilçelere saat 16:00'ya kadar verilen siparişlerde aynı gün teslimat yapıyoruz.",
        },
        {
          question: 'Çiçekler ne kadar taze kalır?',
          answer:
            'Çiçeklerimiz günlük taze kesimdir. Uygun bakım koşullarında 5-10 gün arasında tazeliğini korur. Her buketle birlikte bakım kartı gönderiyoruz.',
        },
        {
          question: 'Özel tasarım buket yaptırabilir miyim?',
          answer:
            'Elbette! WhatsApp veya telefon ile bize ulaşarak istediğiniz renk, çiçek ve bütçeye göre özel tasarım buket sipariş edebilirsiniz.',
        },
        {
          question: 'Ödeme seçenekleriniz nelerdir?',
          answer:
            'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerimiz mevcuttur.',
        },
        {
          question: 'Kurumsal anlaşma yapıyor musunuz?',
          answer:
            'Evet, ofis ve iş yerleri için haftalık/aylık taze çiçek aboneliği ve özel kurumsal fiyatlar sunuyoruz.',
        },
      ],
      layout: 'accordion',
      allowMultiple: false,
      columns: '1',
    },
  },
  {
    id: 'default-contact',
    type: 'contactForm.v1',
    order: 9,
    enabled: true,
    config: {
      title: 'Bize Ulaşın',
      subtitle:
        'Sorularınız, özel siparişleriniz veya kurumsal talepleriniz için bizimle iletişime geçebilirsiniz.',
      showName: true,
      showPhone: true,
      showSubject: true,
      submitText: 'Mesaj Gönder',
      successMessage:
        'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız. 🌸',
      layout: 'stacked',
    },
  },
];
