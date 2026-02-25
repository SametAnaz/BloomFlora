/**
 * Public Site Header
 * Mobile-first responsive header with logo and navigation
 */

'use client';

import { useState } from 'react';

import Link from 'next/link';

import { CartIcon } from '@/components/cart/cart-icon';

interface NavItem {
  label: string;
  href: string;
}

interface HeaderProps {
  /** Site logo URL */
  logoUrl?: string;
  /** Site name (shown when no logo) */
  siteName?: string;
  /** Navigation items */
  navItems?: NavItem[];
  /** WhatsApp number (needed for cart checkout) */
  whatsappNumber?: string;
}

const defaultNavItems: NavItem[] = [
  { label: 'Ana Sayfa', href: '/' },
  { label: 'Ürünler', href: '/urunler' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'İletişim', href: '/iletisim' },
];

export function Header({
  logoUrl,
  siteName = 'BloomFlora',
  navItems = defaultNavItems,
}: HeaderProps) {
  // whatsappNumber used indirectly by CartDrawer via context
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#4D1D2A] text-[#F5E6E8] backdrop-blur">
      <div className="container-mobile">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={siteName}
                className="h-10 w-auto"
              />
            ) : (
              <span className="text-xl font-bold text-[#D4919A]">{siteName}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[#C4959E] transition-colors hover:text-[#F5E6E8]"
              >
                {item.label}
              </Link>
            ))}
            {/* Cart Icon */}
            <CartIcon />
          </nav>

          {/* Mobile: Cart + Hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <CartIcon />
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-md"
            aria-label={isMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={isMenuOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen ? <nav className="border-t border-[#6B2D3D] py-4 md:hidden">
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-[#C4959E] transition-colors hover:bg-[#5E2A38] hover:text-[#F5E6E8]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav> : null}
      </div>
    </header>
  );
}
