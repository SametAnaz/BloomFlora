import { Geist, Geist_Mono } from "next/font/google";

import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bloom Flora - Rize Çiçekçi | Çiçek Siparişi & Süs Eşyaları | Yakında Hizmette",
  description: "Bloom Flora Rize'de çiçekçilik ve süs eşyaları konusunda uzman. Taze çiçekler, bitki bakımı, dekoratif süs eşyaları, hediyelik eşya ve özel günler için çiçek aranjmanları. Hediye seçenekleri ve özel paketleme. Müftü Mahallesi, Rize merkez. Yakında hizmete açılıyoruz.",
  keywords: "rize çiçekçi, rize çiçek siparişi, bloom flora, çiçekçilik rize, süs eşyaları rize, bitki satışı rize, çiçek aranjmanı, dekorasyon rize, taze çiçek, doğum günü çiçeği, düğün çiçeği, rize merkez çiçekçi, online çiçek siparişi rize, hediye çiçek, hediyelik eşya rize, hediye paketi, özel hediye, hediye seçenekleri, hediyelik süs eşyası, çiçek hediye, bitki hediye, hediye sepeti, özel günler hediye, rize hediyelik, dekoratif hediye, hediye fikirleri",
  authors: [{ name: "Bloom Flora" }],
  creator: "Bloom Flora",
  publisher: "Bloom Flora",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://bloomflora.com',
    siteName: 'Bloom Flora',
    title: 'Bloom Flora - Rize Çiçekçi | Çiçek Siparişi & Süs Eşyaları',
    description: 'Rize\'de çiçekçilik ve süs eşyaları konusunda uzman. Taze çiçekler, bitki bakımı, hediyelik eşya ve özel günler için çiçek aranjmanları. Yakında hizmete açılıyoruz.',
    images: [
      {
        url: '/circle-logo.png',
        width: 578,
        height: 578,
        alt: 'Bloom Flora Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bloom Flora - Rize Çiçekçi | Çiçek Siparişi & Süs Eşyaları',
    description: 'Rize\'de çiçekçilik, süs eşyaları ve hediyelik eşya konusunda uzman. Yakında hizmete açılıyoruz.',
    images: ['/circle-logo.png'],
  },
  icons: {
    icon: [
      { url: '/circle-logo.png', sizes: '578x578', type: 'image/png' },
    ],
    apple: [
      { url: '/circle-logo.png', sizes: '578x578', type: 'image/png' },
    ],
    shortcut: '/circle-logo.png',
  },
  alternates: {
    canonical: 'https://bloomflora.com',
  },
  category: 'çiçekçilik',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Florist',
    name: 'Bloom Flora',
    image: 'https://bloomflora.com/circle-logo.png',
    '@id': 'https://bloomflora.com',
    url: 'https://bloomflora.com',
    telephone: '+90-XXX-XXX-XXXX',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Müftü Mahallesi, Stadyum Sokak No: 32/A',
      addressLocality: 'Merkez',
      addressRegion: 'Rize',
      postalCode: '53020',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.020487,
      longitude: 40.523433,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      opens: '09:00',
      closes: '19:00',
    },
    sameAs: [
      'https://www.instagram.com/p/DT0xmZFjCdf/',
    ],
    description: 'Rize\'de çiçekçilik ve süs eşyaları konusunda uzman. Taze çiçekler, bitki bakımı, dekoratif süs eşyaları, hediyelik eşya ve özel günler için çiçek aranjmanları sunuyoruz. Hediye paketleme ve özel hediye seçenekleri ile sevdiklerinizi mutlu edin.',
    areaServed: {
      '@type': 'City',
      name: 'Rize',
    },
    email: 'bloomflorarize@gmail.com',
    paymentAccepted: 'Cash, Credit Card',
    currenciesAccepted: 'TRY',
  };

  return (
    <html lang="tr">
      <head>
        <script
          defer
          src="https://umami.metropolreklam.net/script.js"
          data-website-id="c65672a6-edde-4f6f-9e33-968722cbdd60"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="geo.region" content="TR-53" />
        <meta name="geo.placename" content="Rize" />
        <meta name="geo.position" content="41.020487;40.523433" />
        <meta name="ICBM" content="41.020487, 40.523433" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
