/**
 * Navigation Types
 * Shared types for header & footer navigation config
 */

export interface NavLink {
  id: string;
  label: string;
  href: string;
  order: number;
  openInNewTab?: boolean;
}

/* ── Header ─────────────────────────────────────────────────── */

export interface HeaderConfig {
  links: NavLink[];
  logoPosition: 'left' | 'center';
  sticky: boolean;
}

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  links: [
    { id: 'h1', label: 'Ana Sayfa', href: '/', order: 0 },
    { id: 'h2', label: 'Ürünler', href: '/urunler', order: 1 },
    { id: 'h3', label: 'Hakkımızda', href: '/hakkimizda', order: 2 },
    { id: 'h4', label: 'İletişim', href: '/iletisim', order: 3 },
  ],
  logoPosition: 'left',
  sticky: true,
};

/* ── Footer ─────────────────────────────────────────────────── */

export interface FooterColumn {
  id: string;
  title: string;
  links: NavLink[];
}

export interface FooterConfig {
  columns: FooterColumn[];
  showBrand: boolean;
  brandText: string;
  copyrightText: string;
  columnLayout: 2 | 3 | 4;
}

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  columns: [
    {
      id: 'fc1',
      title: 'Hızlı Bağlantılar',
      links: [
        { id: 'f1', label: 'Ana Sayfa', href: '/', order: 0 },
        { id: 'f2', label: 'Ürünler', href: '/urunler', order: 1 },
        { id: 'f3', label: 'Hakkımızda', href: '/hakkimizda', order: 2 },
        { id: 'f4', label: 'İletişim', href: '/iletisim', order: 3 },
      ],
    },
  ],
  showBrand: true,
  brandText: 'Kaliteli ürünler ve profesyonel hizmet anlayışıyla sizlere en iyisini sunuyoruz.',
  copyrightText: '',
  columnLayout: 4,
};
