/**
 * Hero Module v1
 * Full-width hero section with title, subtitle, CTA, and background
 */

import { z } from 'zod';

import {
  backgroundConfigSchema,
  linkConfigSchema,
  spacingConfigSchema,
  type ModuleDefinition,
} from '../../types';

// =====================================================
// Config Schema
// =====================================================

export const heroV1ConfigSchema = z.object({
  /** Main heading text */
  title: z.string().min(1),
  /** Subtitle/description text */
  subtitle: z.string().optional(),
  /** Text alignment */
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  /** Primary CTA button */
  primaryCta: linkConfigSchema.optional(),
  /** Secondary CTA button */
  secondaryCta: linkConfigSchema.optional(),
  /** Background settings */
  background: backgroundConfigSchema.default({ type: 'none' }),
  /** Section height */
  height: z.enum(['auto', 'small', 'medium', 'large', 'fullscreen']).default('medium'),
  /** Spacing */
  spacing: spacingConfigSchema.default({}),
  /** Text color override (for dark backgrounds) */
  textColor: z.enum(['auto', 'light', 'dark']).default('auto'),
});

export type HeroV1Config = z.infer<typeof heroV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const heroV1DefaultConfig: HeroV1Config = {
  title: 'Hoş Geldiniz',
  subtitle: 'İşletmeniz için profesyonel çözümler sunuyoruz.',
  alignment: 'center',
  primaryCta: {
    text: 'Keşfet',
    href: '#catalog',
    variant: 'primary',
  },
  secondaryCta: {
    text: 'İletişim',
    href: '#contact',
    variant: 'outline',
  },
  background: {
    type: 'color',
    color: 'var(--primary)',
    overlayOpacity: 0,
  },
  height: 'medium',
  spacing: {
    paddingTop: 'lg',
    paddingBottom: 'lg',
  },
  textColor: 'auto',
};

// =====================================================
// Module Metadata
// =====================================================

export const heroV1Meta = {
  id: 'hero.v1',
  name: 'Hero Bölümü',
  description: 'Tam genişlik hero alanı - başlık, alt başlık ve CTA butonları',
  category: 'hero' as const,
  icon: 'Layout',
  version: '1.0.0',
  tags: ['hero', 'banner', 'header', 'cta'],
};

// =====================================================
// Placeholder Components (will be replaced with real ones)
// =====================================================

// Render component - placeholder for now
function HeroV1Render({
  block,
  isPreview,
}: {
  block: { config: HeroV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;

  const heightClasses: Record<string, string> = {
    auto: 'py-16 md:py-24',
    small: 'min-h-[300px] md:min-h-[400px]',
    medium: 'min-h-[400px] md:min-h-[500px]',
    large: 'min-h-[500px] md:min-h-[600px]',
    fullscreen: 'min-h-screen',
  };

  const alignmentClasses: Record<string, string> = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <section
      className={`relative flex flex-col justify-center ${heightClasses[config.height]} ${alignmentClasses[config.alignment]}`}
      style={{
        backgroundColor:
          config.background.type === 'color'
            ? config.background.color
            : undefined,
        backgroundImage:
          config.background.type === 'image' && config.background.image
            ? `url(${config.background.image.src})`
            : config.background.type === 'gradient'
              ? config.background.gradient
              : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      {config.background.overlayOpacity && config.background.overlayOpacity > 0 ? <div
          className="absolute inset-0 bg-black"
          style={{ opacity: config.background.overlayOpacity / 100 }}
        /> : null}

      {/* Content */}
      <div
        className={`container-mobile relative z-10 flex flex-col gap-4 md:gap-6 ${alignmentClasses[config.alignment]}`}
      >
        <h1
          className={`text-3xl font-bold md:text-5xl lg:text-6xl ${
            config.textColor === 'light'
              ? 'text-white'
              : config.textColor === 'dark'
                ? 'text-gray-900'
                : ''
          }`}
        >
          {config.title}
        </h1>

        {config.subtitle ? <p
            className={`max-w-2xl text-lg md:text-xl ${
              config.textColor === 'light'
                ? 'text-white/90'
                : config.textColor === 'dark'
                  ? 'text-gray-700'
                  : 'text-muted-foreground'
            }`}
          >
            {config.subtitle}
          </p> : null}

        {/* CTA Buttons */}
        {(config.primaryCta || config.secondaryCta) ? <div className="mt-4 flex flex-wrap gap-3">
            {config.primaryCta ? (
              isPreview ? (
                <span
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  role="button"
                  tabIndex={0}
                >
                  {config.primaryCta.text}
                </span>
              ) : (
                <a
                  href={config.primaryCta.href}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  target={config.primaryCta.newTab ? '_blank' : undefined}
                  rel={config.primaryCta.newTab ? 'noopener noreferrer' : undefined}
                >
                  {config.primaryCta.text}
                </a>
              )
            ) : null}
            {config.secondaryCta ? (
              isPreview ? (
                <span
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  role="button"
                  tabIndex={0}
                >
                  {config.secondaryCta.text}
                </span>
              ) : (
                <a
                  href={config.secondaryCta.href}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  target={config.secondaryCta.newTab ? '_blank' : undefined}
                  rel={config.secondaryCta.newTab ? 'noopener noreferrer' : undefined}
                >
                  {config.secondaryCta.text}
                </a>
              )
            ) : null}
          </div> : null}
      </div>
    </section>
  );
}

// Editor component
function HeroV1Editor({
  config,
  onChange,
}: {
  config: HeroV1Config;
  onChange: (config: HeroV1Config) => void;
  blockId: string;
}) {
  return (
    <div className="space-y-4 p-4">
      {/* Başlık */}
      <div>
        <label className="mb-1 block text-sm font-medium">Başlık</label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Alt Başlık */}
      <div>
        <label className="mb-1 block text-sm font-medium">Alt Başlık</label>
        <textarea
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
        />
      </div>

      {/* Hizalama & Yükseklik */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Hizalama</label>
          <select
            value={config.alignment}
            onChange={(e) =>
              onChange({ ...config, alignment: e.target.value as 'left' | 'center' | 'right' })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="left">Sol</option>
            <option value="center">Orta</option>
            <option value="right">Sağ</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Yükseklik</label>
          <select
            value={config.height}
            onChange={(e) =>
              onChange({ ...config, height: e.target.value as HeroV1Config['height'] })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="auto">Otomatik</option>
            <option value="small">Küçük</option>
            <option value="medium">Orta</option>
            <option value="large">Büyük</option>
            <option value="fullscreen">Tam Ekran</option>
          </select>
        </div>
      </div>

      {/* Metin Rengi */}
      <div>
        <label className="mb-1 block text-sm font-medium">Metin Rengi</label>
        <select
          value={config.textColor}
          onChange={(e) =>
            onChange({ ...config, textColor: e.target.value as 'auto' | 'light' | 'dark' })
          }
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="auto">Otomatik</option>
          <option value="light">Açık (Beyaz)</option>
          <option value="dark">Koyu (Siyah)</option>
        </select>
      </div>

      {/* Arkaplan */}
      <div className="border-t pt-4">
        <label className="mb-2 block text-sm font-semibold">Arkaplan</label>
        <div>
          <label className="mb-1 block text-sm font-medium">Tip</label>
          <select
            value={config.background.type}
            onChange={(e) =>
              onChange({
                ...config,
                background: { ...config.background, type: e.target.value as 'none' | 'color' | 'image' | 'gradient' },
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="none">Yok</option>
            <option value="color">Düz Renk</option>
            <option value="gradient">Gradyan</option>
            <option value="image">Görsel</option>
          </select>
        </div>

        {config.background.type === 'color' && (
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium">Arkaplan Rengi</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.background.color || '#4D1D2A'}
                onChange={(e) =>
                  onChange({
                    ...config,
                    background: { ...config.background, color: e.target.value },
                  })
                }
                className="h-10 w-12 cursor-pointer rounded border border-input"
              />
              <input
                type="text"
                value={config.background.color || ''}
                onChange={(e) =>
                  onChange({
                    ...config,
                    background: { ...config.background, color: e.target.value },
                  })
                }
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="#4D1D2A"
              />
            </div>
          </div>
        )}

        {config.background.type === 'gradient' && (
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium">Gradyan CSS</label>
            <input
              type="text"
              value={config.background.gradient || ''}
              onChange={(e) =>
                onChange({
                  ...config,
                  background: { ...config.background, gradient: e.target.value },
                })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="linear-gradient(135deg, #4D1D2A 0%, #6B2D3D 100%)"
            />
          </div>
        )}

        {config.background.type === 'image' && (
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium">Görsel URL</label>
            <input
              type="text"
              value={config.background.image?.src || ''}
              onChange={(e) =>
                onChange({
                  ...config,
                  background: { ...config.background, image: { src: e.target.value, alt: '' } },
                })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>
        )}

        {config.background.type !== 'none' && (
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium">
              Overlay Opaklığı: {config.background.overlayOpacity || 0}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.background.overlayOpacity || 0}
              onChange={(e) =>
                onChange({
                  ...config,
                  background: { ...config.background, overlayOpacity: Number(e.target.value) },
                })
              }
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Birincil CTA */}
      <div className="border-t pt-4">
        <label className="mb-2 block text-sm font-semibold">Birincil Buton</label>
        <div className="space-y-2">
          <input
            type="text"
            value={config.primaryCta?.text || ''}
            onChange={(e) =>
              onChange({
                ...config,
                primaryCta: { ...(config.primaryCta || { text: '', href: '' }), text: e.target.value },
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Buton metni"
          />
          <input
            type="text"
            value={config.primaryCta?.href || ''}
            onChange={(e) =>
              onChange({
                ...config,
                primaryCta: { ...(config.primaryCta || { text: '', href: '' }), href: e.target.value },
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Link (ör: /urunler)"
          />
        </div>
      </div>

      {/* İkincil CTA */}
      <div className="border-t pt-4">
        <label className="mb-2 block text-sm font-semibold">İkincil Buton</label>
        <div className="space-y-2">
          <input
            type="text"
            value={config.secondaryCta?.text || ''}
            onChange={(e) =>
              onChange({
                ...config,
                secondaryCta: { ...(config.secondaryCta || { text: '', href: '' }), text: e.target.value },
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Buton metni"
          />
          <input
            type="text"
            value={config.secondaryCta?.href || ''}
            onChange={(e) =>
              onChange({
                ...config,
                secondaryCta: { ...(config.secondaryCta || { text: '', href: '' }), href: e.target.value },
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Link (ör: #iletisim)"
          />
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Module Definition
// =====================================================

export const heroV1Module: ModuleDefinition<HeroV1Config> = {
  meta: heroV1Meta,
  configSchema: heroV1ConfigSchema,
  defaultConfig: heroV1DefaultConfig,
  Render: HeroV1Render,
  Editor: HeroV1Editor,
};
