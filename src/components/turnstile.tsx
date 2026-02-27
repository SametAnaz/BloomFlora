/**
 * Cloudflare Turnstile Widget — React wrapper
 * Loads the Turnstile script and renders the challenge widget.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

/* ── Global type augmentation ────────────────────────────── */

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact';
        },
      ) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

/* ── Props ───────────────────────────────────────────────── */

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  className?: string;
}

/* ── Component ───────────────────────────────────────────── */

export function Turnstile({
  onVerify,
  onExpire,
  onError,
  theme = 'auto',
  size = 'normal',
  className,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !containerRef.current) return;

    // Clean up previous widget if any
    if (widgetIdRef.current) {
      try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
    }

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      console.warn('[Turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set');
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      'expired-callback': onExpire,
      'error-callback': onError,
      theme,
      size,
    });
  }, [onVerify, onExpire, onError, theme, size]);

  useEffect(() => {
    // If script already loaded, render immediately
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Check if script tag already exists
    const existing = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]',
    );

    if (existing) {
      // Script tag exists but hasn't loaded yet — wait
      existing.addEventListener('load', renderWidget);
      return;
    }

    // Load the script
    window.onTurnstileLoad = renderWidget;
    const script = document.createElement('script');
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  return <div ref={containerRef} className={className} />;
}
