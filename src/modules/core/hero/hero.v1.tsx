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

// Editor component - placeholder for now
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
      <div>
        <label className="text-sm font-medium">Başlık</label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Alt Başlık</label>
        <textarea
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
          className="mt-1 w-full rounded-md border px-3 py-2"
          rows={3}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Hizalama</label>
        <select
          value={config.alignment}
          onChange={(e) =>
            onChange({
              ...config,
              alignment: e.target.value as 'left' | 'center' | 'right',
            })
          }
          className="mt-1 w-full rounded-md border px-3 py-2"
        >
          <option value="left">Sol</option>
          <option value="center">Orta</option>
          <option value="right">Sağ</option>
        </select>
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
