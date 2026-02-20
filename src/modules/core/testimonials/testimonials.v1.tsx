/**
 * Testimonials Module v1
 * Elfsight Google Reviews widget embed
 */

import * as React from 'react';

import { z } from 'zod';

import type { ModuleDefinition } from '../../types';

// =====================================================
// Config Schema
// =====================================================

export const testimonialsV1ConfigSchema = z.object({
  /** Elfsight widget app id */
  appId: z.string().default('2a86a615-363c-4b5a-b3d3-64aeb94005ea'),
});

export type TestimonialsV1Config = z.infer<typeof testimonialsV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const testimonialsV1DefaultConfig: TestimonialsV1Config = {
  appId: '2a86a615-363c-4b5a-b3d3-64aeb94005ea',
};

// =====================================================
// Module Metadata
// =====================================================

export const testimonialsV1Meta = {
  id: 'testimonials.v1',
  name: 'Müşteri Yorumları',
  description: 'Google Reviews – Elfsight widget',
  category: 'social' as const,
  icon: 'MessageSquareQuote',
  version: '1.0.0',
  tags: ['testimonials', 'reviews', 'social', 'google', 'elfsight'],
};

// =====================================================
// Render Component
// =====================================================

function TestimonialsV1Render({
  block,
}: {
  block: { config: TestimonialsV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;

  React.useEffect(() => {
    // Load Elfsight platform script once
    if (!document.querySelector('script[src="https://elfsightcdn.com/platform.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://elfsightcdn.com/platform.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // If script was already loaded, re-init the widget
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (win.__elfsight_platform) {
      try {
        win.__elfsight_platform.init();
      } catch {
        // ignore
      }
    }
  }, [config.appId]);

  return (
    <section className="py-8 px-4 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div
          className={`elfsight-app-${config.appId}`}
          data-elfsight-app-lazy
        />
      </div>
    </section>
  );
}

// =====================================================
// Editor Component
// =====================================================

function TestimonialsV1Editor({
  config,
  onChange,
}: {
  config: TestimonialsV1Config;
  onChange: (config: TestimonialsV1Config) => void;
}) {
  return (
    <div className="space-y-4 p-4">
      {/* Info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
        <div className="mb-2 flex items-center gap-2">
          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <span className="font-semibold text-blue-800 dark:text-blue-300">Google Yorumları</span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Bu blok, Elfsight Google Reviews widget&apos;ını kullanarak müşteri
          yorumlarını otomatik olarak Google&apos;dan çeker. Yönetim için{' '}
          <a
            href="https://dash.elfsight.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline hover:no-underline"
          >
            Elfsight Dashboard
          </a>
          &apos;ı kullanın.
        </p>
      </div>

      {/* Widget ID */}
      <div>
        <label className="mb-1 block text-sm font-medium">Widget ID</label>
        <input
          type="text"
          value={config.appId}
          onChange={(e) => onChange({ ...config, appId: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Elfsight panelinden alınan widget kimliği
        </p>
      </div>
    </div>
  );
}

// =====================================================
// Module Definition
// =====================================================

export const testimonialsV1Module: ModuleDefinition<TestimonialsV1Config> = {
  meta: testimonialsV1Meta,
  configSchema: testimonialsV1ConfigSchema,
  defaultConfig: testimonialsV1DefaultConfig,
  Render: TestimonialsV1Render,
  Editor: TestimonialsV1Editor,
};
