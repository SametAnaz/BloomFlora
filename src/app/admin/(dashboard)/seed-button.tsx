'use client';

/**
 * Seed Button Component
 * Client component for triggering default content seed
 */

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

type SeedState = 'idle' | 'loading' | 'success' | 'error';

export function SeedButton() {
  const [state, setState] = useState<SeedState>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSeed = useCallback(async () => {
    if (state === 'loading') return;

    setState('loading');
    setMessage('');

    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setState('success');
        setMessage(
          `Varsayılan içerik yüklendi! ${data.results.homepage ? '✅ Ana Sayfa' : '⏭️ Ana Sayfa (zaten var)'} — ${data.results.theme ? '✅ Tema' : '⏭️ Tema (zaten var)'}`
        );
        // Refresh dashboard stats
        router.refresh();
      } else {
        setState('error');
        setMessage(data.message || 'Bir hata oluştu');
      }
    } catch {
      setState('error');
      setMessage('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  }, [state, router]);

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleSeed}
        disabled={state === 'loading'}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {state === 'loading' ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Yükleniyor...
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            🌸 Varsayılan Çiçekçi İçeriğini Yükle
          </>
        )}
      </button>

      {message && (
        <p
          className={`text-sm ${
            state === 'success'
              ? 'text-green-600'
              : state === 'error'
                ? 'text-destructive'
                : 'text-muted-foreground'
          }`}
        >
          {message}
        </p>
      )}

      {state === 'success' && (
        <div className="flex gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            Siteyi Görüntüle ↗
          </a>
          <a
            href="/admin/pages"
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            Sayfaları Düzenle →
          </a>
        </div>
      )}
    </div>
  );
}
