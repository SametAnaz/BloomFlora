/**
 * CTA (Call to Action) Module v1
 * Banner with call to action buttons
 */

import { z } from 'zod';

import type { ModuleDefinition } from '../../types';

// =====================================================
// Config Schema
// =====================================================

export const ctaV1ConfigSchema = z.object({
  /** Title */
  title: z.string().min(1),
  /** Description */
  description: z.string().optional(),
  /** Primary button text */
  primaryButtonText: z.string().optional(),
  /** Primary button link */
  primaryButtonLink: z.string().optional(),
  /** Secondary button text */
  secondaryButtonText: z.string().optional(),
  /** Secondary button link */
  secondaryButtonLink: z.string().optional(),
  /** Background style */
  style: z.enum(['solid', 'gradient', 'image']).default('gradient'),
  /** Background color */
  backgroundColor: z.string().optional(),
  /** Background image */
  backgroundImage: z.string().optional(),
  /** Alignment */
  alignment: z.enum(['left', 'center', 'right']).default('center'),
});

export type CtaV1Config = z.infer<typeof ctaV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const ctaV1DefaultConfig: CtaV1Config = {
  title: 'Bugün Siparişinizi Verin!',
  description:
    'En taze çiçekler, en özel anlarınız için. İlk siparişinizde %10 indirim fırsatını kaçırmayın.',
  primaryButtonText: 'Alışverişe Başla',
  primaryButtonLink: '/urunler',
  secondaryButtonText: 'Daha Fazla Bilgi',
  secondaryButtonLink: '/hakkimizda',
  style: 'gradient',
  alignment: 'center',
};

// =====================================================
// Module Metadata
// =====================================================

export const ctaV1Meta = {
  id: 'cta.v1',
  name: 'Aksiyon Çağrısı',
  description: 'Dikkat çekici banner ve butonlarla aksiyon çağrısı',
  category: 'hero' as const,
  icon: 'Megaphone',
  version: '1.0.0',
  tags: ['cta', 'banner', 'action', 'button'],
};

// =====================================================
// Render Component
// =====================================================

function CtaV1Render({
  block,
}: {
  block: { config: CtaV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;

  const alignmentClasses: Record<string, string> = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const getBackgroundStyle = () => {
    switch (config.style) {
      case 'solid':
        return {
          backgroundColor: config.backgroundColor || 'hsl(var(--primary))',
        };
      case 'image':
        return {
          backgroundImage: config.backgroundImage
            ? `url(${config.backgroundImage})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      case 'gradient':
      default:
        return {
          background:
            'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)',
        };
    }
  };

  return (
    <section className="py-4 px-4 md:px-8">
      <div
        className="mx-auto max-w-6xl rounded-2xl px-8 py-16 md:px-16 md:py-20"
        style={getBackgroundStyle()}
      >
        <div
          className={`relative z-10 flex flex-col ${alignmentClasses[config.alignment]}`}
        >
          {/* Overlay for image background */}
          {config.style === 'image' && (
            <div className="absolute inset-0 rounded-2xl bg-black/50" />
          )}

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              {config.title}
            </h2>

            {config.description && (
              <p className="mt-4 max-w-2xl text-lg text-white/90 md:text-xl">
                {config.description}
              </p>
            )}

            {/* Buttons */}
            {(config.primaryButtonText || config.secondaryButtonText) && (
              <div
                className={`mt-8 flex flex-col gap-4 sm:flex-row ${
                  config.alignment === 'center' ? 'justify-center' : ''
                } ${config.alignment === 'right' ? 'justify-end' : ''}`}
              >
                {config.primaryButtonText && (
                  <a
                    href={config.primaryButtonLink || '#'}
                    className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-primary transition-transform hover:scale-105"
                  >
                    {config.primaryButtonText}
                  </a>
                )}
                {config.secondaryButtonText && (
                  <a
                    href={config.secondaryButtonLink || '#'}
                    className="inline-flex items-center justify-center rounded-lg border-2 border-white px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    {config.secondaryButtonText}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// =====================================================
// Editor Component
// =====================================================

function CtaV1Editor({
  config,
  onChange,
}: {
  config: CtaV1Config;
  onChange: (config: CtaV1Config) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Başlık</label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Açıklama</label>
        <textarea
          value={config.description || ''}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Stil</label>
          <select
            value={config.style}
            onChange={(e) =>
              onChange({
                ...config,
                style: e.target.value as 'solid' | 'gradient' | 'image',
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="gradient">Gradyan</option>
            <option value="solid">Düz Renk</option>
            <option value="image">Görsel</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Hizalama</label>
          <select
            value={config.alignment}
            onChange={(e) =>
              onChange({
                ...config,
                alignment: e.target.value as 'left' | 'center' | 'right',
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="left">Sol</option>
            <option value="center">Orta</option>
            <option value="right">Sağ</option>
          </select>
        </div>
      </div>

      {/* Background Color - shown when style is solid */}
      {config.style === 'solid' && (
        <div>
          <label className="mb-1 block text-sm font-medium">Arkaplan Rengi</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.backgroundColor || '#4D1D2A'}
              onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })}
              className="h-10 w-12 cursor-pointer rounded border border-input"
            />
            <input
              type="text"
              value={config.backgroundColor || ''}
              onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="#4D1D2A"
            />
          </div>
        </div>
      )}

      {/* Background Image - shown when style is image */}
      {config.style === 'image' && (
        <div>
          <label className="mb-1 block text-sm font-medium">Arkaplan Görseli URL</label>
          <input
            type="text"
            value={config.backgroundImage || ''}
            onChange={(e) => onChange({ ...config, backgroundImage: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="https://images.unsplash.com/..."
          />
        </div>
      )}

      <div className="border-t pt-4">
        <p className="mb-2 text-sm font-medium">Birincil Buton</p>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Buton Metni"
            value={config.primaryButtonText || ''}
            onChange={(e) =>
              onChange({ ...config, primaryButtonText: e.target.value })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Buton Linki"
            value={config.primaryButtonLink || ''}
            onChange={(e) =>
              onChange({ ...config, primaryButtonLink: e.target.value })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="mb-2 text-sm font-medium">İkincil Buton</p>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Buton Metni"
            value={config.secondaryButtonText || ''}
            onChange={(e) =>
              onChange({ ...config, secondaryButtonText: e.target.value })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Buton Linki"
            value={config.secondaryButtonLink || ''}
            onChange={(e) =>
              onChange({ ...config, secondaryButtonLink: e.target.value })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Module Definition
// =====================================================

export const ctaV1Module: ModuleDefinition<CtaV1Config> = {
  meta: ctaV1Meta,
  configSchema: ctaV1ConfigSchema,
  defaultConfig: ctaV1DefaultConfig,
  Render: CtaV1Render,
  Editor: CtaV1Editor,
};
