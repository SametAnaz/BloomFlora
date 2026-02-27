/**
 * Public Site Header
 * Mobile-first responsive header with logo and navigation.
 * Accepts HeaderConfig from admin or falls back to defaults.
 */

'use client';

import { useState } from 'react';

import Link from 'next/link';

import { CartIcon } from '@/components/cart/cart-icon';
import type { HeaderConfig, NavLink } from '@/lib/navigation/types';
import { DEFAULT_HEADER_CONFIG } from '@/lib/navigation/types';

interface HeaderProps {
  /** Site logo URL */
  logoUrl?: string;
  /** Site name (shown when no logo) */
  siteName?: string;
  /** Header config from admin panel */
  config?: HeaderConfig;
  /** WhatsApp number (needed for cart checkout) */
  whatsappNumber?: string;
}

function sortedLinks(links: NavLink[]) {
  return [...links].sort((a, b) => a.order - b.order);
}

export function Header({
  logoUrl,
  siteName = 'BloomFlora',
  config,
}: HeaderProps) {
  const cfg = config || DEFAULT_HEADER_CONFIG;
  const navItems = sortedLinks(cfg.links).filter((l) => l.label.trim());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={`${cfg.sticky ? 'sticky top-0' : ''} z-50 bg-[#4D1D2A] text-[#F5E6E8] backdrop-blur`}>
      <div className="container-mobile">
        <div className={`flex h-16 items-center ${cfg.logoPosition === 'center' ? 'justify-center' : 'justify-between'}`}>
          {/* Logo */}
          {cfg.logoPosition === 'center' && (
            <div className="absolute left-4 flex items-center gap-1 md:hidden">
              <CartIcon />
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-md"
                aria-label={isMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
                aria-expanded={isMenuOpen}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}

          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteName} className="h-10 w-auto" />
            ) : (
              <span className="text-xl font-bold text-[#D4919A]">{siteName}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          {cfg.logoPosition === 'center' ? (
            <nav className="absolute right-4 hidden md:flex md:items-center md:gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  {...(item.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="text-sm font-medium text-[#C4959E] transition-colors hover:text-[#F5E6E8]"
                >
                  {item.label}
                </Link>
              ))}
              <CartIcon />
            </nav>
          ) : (
            <nav className="hidden md:flex md:items-center md:gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  {...(item.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="text-sm font-medium text-[#C4959E] transition-colors hover:text-[#F5E6E8]"
                >
                  {item.label}
                </Link>
              ))}
              <CartIcon />
            </nav>
          )}

          {/* Mobile: Cart + Hamburger (left-logo variant) */}
          {cfg.logoPosition === 'left' && (
            <div className="flex items-center gap-1 md:hidden">
              <CartIcon />
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-md"
                aria-label={isMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
                aria-expanded={isMenuOpen}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen ? <nav className="border-t border-[#6B2D3D] py-4 md:hidden">
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    {...(item.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
