/**
 * Mobile Warning Component
 * Shows a warning on mobile devices that admin panel requires desktop
 */

'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

export function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm lg:hidden">
      <div className="max-w-md space-y-4 rounded-lg border bg-card p-6 text-center shadow-lg">
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold">Masaüstü Gerekli</h2>

        {/* Description */}
        <p className="text-muted-foreground">
          Yönetim paneli, masaüstü veya tablet cihazlarda daha iyi bir deneyim sunar.
          En iyi sonuç için lütfen daha geniş bir ekran kullanın.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => setDismissed(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Yine de devam et
          </button>
          <Link
            href="/"
            className="rounded-md border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  );
}
