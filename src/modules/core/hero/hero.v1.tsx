/**
 * Hero Module v1
 * Full-width hero section with title, subtitle, CTA, and background
 */

import * as React from 'react';

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

const textStyleSchema = z.object({
  fontSize: z.enum(['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl']).optional(),
  fontWeight: z.enum(['normal', 'medium', 'semibold', 'bold', 'extrabold']).optional(),
  fontStyle: z.enum(['normal', 'italic']).optional(),
  textDecoration: z.enum(['none', 'underline', 'line-through']).optional(),
  color: z.string().optional(),
});

const heroButtonSchema = linkConfigSchema.extend({
  id: z.string().optional(),
});

export const heroV1ConfigSchema = z.object({
  /** Main heading text */
  title: z.string().min(1),
  /** Title text style */
  titleStyle: textStyleSchema.optional(),
  /** Subtitle/description text */
  subtitle: z.string().optional(),
  /** Subtitle text style */
  subtitleStyle: textStyleSchema.optional(),
  /** Text alignment */
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  /** CTA buttons (dynamic list) */
  buttons: z.array(heroButtonSchema).default([]),
  /** Primary CTA button (legacy — kept for backward compat) */
  primaryCta: linkConfigSchema.optional(),
  /** Secondary CTA button (legacy) */
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
  titleStyle: { fontSize: '5xl', fontWeight: 'bold' },
  subtitle: 'İşletmeniz için profesyonel çözümler sunuyoruz.',
  subtitleStyle: { fontSize: 'xl', fontWeight: 'normal' },
  alignment: 'center',
  buttons: [
    { id: 'btn-1', text: 'Keşfet', href: '#catalog', variant: 'primary' },
    { id: 'btn-2', text: 'İletişim', href: '#contact', variant: 'outline' },
  ],
  background: {
    type: 'color',
    color: 'var(--primary)',
    overlayOpacity: 0,
  },
  height: 'medium',
  spacing: { paddingTop: 'lg', paddingBottom: 'lg' },
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
// Helpers
// =====================================================

type HeroButton = z.infer<typeof heroButtonSchema>;

/** Merge legacy primaryCta/secondaryCta into buttons array */
function resolveButtons(config: HeroV1Config): HeroButton[] {
  if (config.buttons && config.buttons.length > 0) return config.buttons;
  const btns: HeroButton[] = [];
  if (config.primaryCta) btns.push({ ...config.primaryCta, id: 'legacy-primary', variant: config.primaryCta.variant || 'primary' });
  if (config.secondaryCta) btns.push({ ...config.secondaryCta, id: 'legacy-secondary', variant: config.secondaryCta.variant || 'outline' });
  return btns;
}

const fontSizeClasses: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl md:text-5xl',
  '5xl': 'text-4xl md:text-5xl lg:text-6xl',
  '6xl': 'text-5xl md:text-6xl lg:text-7xl',
};

const fontWeightClasses: Record<string, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const fontStyleClasses: Record<string, string> = {
  normal: 'not-italic',
  italic: 'italic',
};

const textDecorationClasses: Record<string, string> = {
  none: 'no-underline',
  underline: 'underline',
  'line-through': 'line-through',
};

const variantClasses: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

// =====================================================
// Render Component
// =====================================================

function HeroV1Render({
  block,
  isPreview,
}: {
  block: { config: HeroV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;
  const buttons = resolveButtons(config);

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

  const titleFontSize = config.titleStyle?.fontSize || '5xl';
  const titleWeight = config.titleStyle?.fontWeight || 'bold';
  const titleFontStyle = config.titleStyle?.fontStyle || 'normal';
  const titleDecoration = config.titleStyle?.textDecoration || 'none';
  const subtitleFontSize = config.subtitleStyle?.fontSize || 'xl';
  const subtitleWeight = config.subtitleStyle?.fontWeight || 'normal';
  const subtitleFontStyle = config.subtitleStyle?.fontStyle || 'normal';
  const subtitleDecoration = config.subtitleStyle?.textDecoration || 'none';

  const textColorBase = config.textColor === 'light' ? 'text-white' : config.textColor === 'dark' ? 'text-gray-900' : '';
  const subtitleColorBase = config.textColor === 'light' ? 'text-white/90' : config.textColor === 'dark' ? 'text-gray-700' : 'text-muted-foreground';

  return (
    <section
      className={`relative flex flex-col justify-center ${heightClasses[config.height]} ${alignmentClasses[config.alignment]}`}
      style={(() => {
        const { getBackgroundStyle } = require('../../shared/background-picker') as { getBackgroundStyle: typeof import('../../shared/background-picker').getBackgroundStyle };
        return getBackgroundStyle(config.background);
      })()}
    >
      {/* Overlay */}
      {config.background.overlayOpacity && config.background.overlayOpacity > 0 ? (
        <div className="absolute inset-0 bg-black" style={{ opacity: config.background.overlayOpacity / 100 }} />
      ) : null}

      {/* Content */}
      <div className={`container-mobile relative z-10 flex flex-col gap-4 md:gap-6 ${alignmentClasses[config.alignment]}`}>
        <h1
          className={`${fontSizeClasses[titleFontSize]} ${fontWeightClasses[titleWeight]} ${fontStyleClasses[titleFontStyle]} ${textDecorationClasses[titleDecoration]} ${textColorBase}`}
          style={{ color: config.titleStyle?.color || undefined }}
        >
          {config.title}
        </h1>

        {config.subtitle ? (
          <p
            className={`max-w-2xl ${fontSizeClasses[subtitleFontSize]} ${fontWeightClasses[subtitleWeight]} ${fontStyleClasses[subtitleFontStyle]} ${textDecorationClasses[subtitleDecoration]} ${subtitleColorBase}`}
            style={{ color: config.subtitleStyle?.color || undefined }}
          >
            {config.subtitle}
          </p>
        ) : null}

        {/* CTA Buttons */}
        {buttons.length > 0 ? (
          <div className={`mt-4 flex flex-wrap gap-3 ${config.alignment === 'center' ? 'justify-center' : config.alignment === 'right' ? 'justify-end' : ''}`}>
            {buttons.map((btn, i) => {
              const cls = `inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors ${variantClasses[btn.variant || 'primary']}`;
              return isPreview ? (
                <span key={btn.id || i} className={cls} role="button" tabIndex={0}>
                  {btn.text}
                </span>
              ) : (
                <a
                  key={btn.id || i}
                  href={btn.href}
                  className={cls}
                  target={btn.newTab ? '_blank' : undefined}
                  rel={btn.newTab ? 'noopener noreferrer' : undefined}
                >
                  {btn.text}
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}

// =====================================================
// Editor Component
// =====================================================

function HeroV1Editor({
  config,
  onChange,
}: {
  config: HeroV1Config;
  onChange: (config: HeroV1Config) => void;
  blockId: string;
}) {
  const [showAddButton, setShowAddButton] = React.useState(false);

  const buttons = resolveButtons(config);

  // --- helpers ---
  const updateButtons = (newBtns: HeroButton[]) => {
    onChange({ ...config, buttons: newBtns, primaryCta: undefined, secondaryCta: undefined });
  };

  const addButton = (variant: string) => {
    const id = `btn-${Date.now()}`;
    const labels: Record<string, string> = {
      primary: 'Birincil Buton',
      secondary: 'İkincil Buton',
      outline: 'Çerçeveli Buton',
      ghost: 'Hayalet Buton',
      link: 'Link Buton',
    };
    updateButtons([...buttons, { id, text: labels[variant] || 'Buton', href: '/', variant: variant as HeroButton['variant'] }]);
    setShowAddButton(false);
  };

  const removeButton = (index: number) => {
    updateButtons(buttons.filter((_, i) => i !== index));
  };

  const updateButton = (index: number, updates: Partial<HeroButton>) => {
    const newBtns = [...buttons];
    newBtns[index] = { ...newBtns[index], ...updates };
    updateButtons(newBtns);
  };

  const selectFieldCls = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm';
  const inputCls = selectFieldCls;
  const labelCls = 'mb-1 block text-sm font-medium';

  return (
    <div className="space-y-4 p-4">
      {/* ── Başlık ─────────────────────── */}
      <div className="space-y-2">
        <label className={labelCls}>Başlık</label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className={inputCls}
        />
        {/* Title text formatting */}
        <div className="space-y-2">
          <div>
            <label className="mb-0.5 block text-xs text-muted-foreground">Boyut</label>
            <select
              value={config.titleStyle?.fontSize || '5xl'}
              onChange={(e) => onChange({ ...config, titleStyle: { ...config.titleStyle, fontSize: e.target.value as 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' } })}
              className={selectFieldCls}
            >
              <option value="sm">Küçük</option>
              <option value="base">Normal</option>
              <option value="lg">Orta</option>
              <option value="xl">Büyük</option>
              <option value="2xl">2XL</option>
              <option value="3xl">3XL</option>
              <option value="4xl">4XL</option>
              <option value="5xl">5XL</option>
              <option value="6xl">6XL</option>
            </select>
          </div>
          <HeroTextStyleField
            value={config.titleStyle || {}}
            onChange={(s) => onChange({ ...config, titleStyle: { ...config.titleStyle, ...s } })}
          />
        </div>
      </div>

      {/* ── Alt Başlık ─────────────────── */}
      <div className="space-y-2">
        <label className={labelCls}>Alt Başlık</label>
        <textarea
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
          className={inputCls}
          rows={3}
        />
        {/* Subtitle text formatting */}
        <div className="space-y-2">
          <div>
            <label className="mb-0.5 block text-xs text-muted-foreground">Boyut</label>
            <select
              value={config.subtitleStyle?.fontSize || 'xl'}
              onChange={(e) => onChange({ ...config, subtitleStyle: { ...config.subtitleStyle, fontSize: e.target.value as 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' } })}
              className={selectFieldCls}
            >
              <option value="sm">Küçük</option>
              <option value="base">Normal</option>
              <option value="lg">Orta</option>
              <option value="xl">Büyük</option>
              <option value="2xl">2XL</option>
              <option value="3xl">3XL</option>
            </select>
          </div>
          <HeroTextStyleField
            value={config.subtitleStyle || {}}
            onChange={(s) => onChange({ ...config, subtitleStyle: { ...config.subtitleStyle, ...s } })}
          />
        </div>
      </div>

      {/* ── Hizalama & Yükseklik ──────── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Hizalama</label>
          <select value={config.alignment} onChange={(e) => onChange({ ...config, alignment: e.target.value as 'left' | 'center' | 'right' })} className={selectFieldCls}>
            <option value="left">Sol</option>
            <option value="center">Orta</option>
            <option value="right">Sağ</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Yükseklik</label>
          <select value={config.height} onChange={(e) => onChange({ ...config, height: e.target.value as HeroV1Config['height'] })} className={selectFieldCls}>
            <option value="auto">Otomatik</option>
            <option value="small">Küçük</option>
            <option value="medium">Orta</option>
            <option value="large">Büyük</option>
            <option value="fullscreen">Tam Ekran</option>
          </select>
        </div>
      </div>

      {/* ── Metin Rengi ───────────────── */}
      <div>
        <label className={labelCls}>Metin Rengi (Genel)</label>
        <select value={config.textColor} onChange={(e) => onChange({ ...config, textColor: e.target.value as 'auto' | 'light' | 'dark' })} className={selectFieldCls}>
          <option value="auto">Otomatik</option>
          <option value="light">Açık (Beyaz)</option>
          <option value="dark">Koyu (Siyah)</option>
        </select>
      </div>

      {/* ── Arkaplan ──────────────────── */}
      <HeroBackgroundPicker
        value={config.background}
        onChange={(bg) => onChange({ ...config, background: bg })}
      />

      {/* ── Butonlar ──────────────────── */}
      <div className="border-t pt-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold">Butonlar</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddButton(!showAddButton)}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              + Buton Ekle
            </button>
            {showAddButton && (
              <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border bg-card shadow-lg">
                <div className="p-1">
                  {[
                    { variant: 'primary', label: 'Birincil Buton', desc: 'Ana aksiyon butonu', preview: 'bg-primary text-primary-foreground' },
                    { variant: 'secondary', label: 'İkincil Buton', desc: 'Destekleyici buton', preview: 'bg-secondary text-secondary-foreground' },
                    { variant: 'outline', label: 'Çerçeveli Buton', desc: 'Kenarlıklı buton', preview: 'border border-input bg-background' },
                    { variant: 'ghost', label: 'Hayalet Buton', desc: 'Arkaplanı olmayan', preview: 'bg-transparent' },
                    { variant: 'link', label: 'Link', desc: 'Altı çizili link', preview: 'text-primary underline' },
                  ].map((item) => (
                    <button
                      key={item.variant}
                      type="button"
                      onClick={() => addButton(item.variant)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent"
                    >
                      <span className={`inline-flex h-8 items-center rounded px-3 text-xs ${item.preview}`}>
                        Aa
                      </span>
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {buttons.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">Henüz buton eklenmemiş</p>
        )}

        <div className="space-y-3">
          {buttons.map((btn, index) => (
            <div key={btn.id || index} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-6 items-center rounded px-2 text-xs ${variantClasses[btn.variant || 'primary']}`}>
                    {btn.variant || 'primary'}
                  </span>
                  <span className="text-sm font-medium">{btn.text}</span>
                </div>
                <button type="button" onClick={() => removeButton(index)} className="rounded p-1 text-destructive hover:bg-destructive/10">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={btn.text}
                  onChange={(e) => updateButton(index, { text: e.target.value })}
                  className={inputCls}
                  placeholder="Buton metni"
                />
                <input
                  type="text"
                  value={btn.href}
                  onChange={(e) => updateButton(index, { href: e.target.value })}
                  className={inputCls}
                  placeholder="Link (ör: /urunler veya #iletisim)"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={btn.variant || 'primary'}
                    onChange={(e) => updateButton(index, { variant: e.target.value as HeroButton['variant'] })}
                    className={selectFieldCls}
                  >
                    <option value="primary">Birincil</option>
                    <option value="secondary">İkincil</option>
                    <option value="outline">Çerçeveli</option>
                    <option value="ghost">Hayalet</option>
                    <option value="link">Link</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={btn.newTab || false}
                      onChange={(e) => updateButton(index, { newTab: e.target.checked })}
                      className="rounded"
                    />
                    Yeni sekmede aç
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Wrapper for shared BackgroundPicker (avoids 'use client' issue)
// =====================================================

function HeroBackgroundPicker({ value, onChange }: { value: HeroV1Config['background']; onChange: (bg: HeroV1Config['background']) => void }) {
  const { BackgroundPicker } = require('../../shared/background-picker') as { BackgroundPicker: typeof import('../../shared/background-picker').BackgroundPicker };
  return <BackgroundPicker value={value} onChange={onChange} imageFolder="hero" />;
}

function HeroTextStyleField({ value, onChange }: { value: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) {
  const { TextStyleField } = require('../../shared/text-style-field') as typeof import('../../shared/text-style-field');
  return <TextStyleField value={value as import('../../shared/text-style-field').TextStyleFieldValue} onChange={onChange as (v: import('../../shared/text-style-field').TextStyleFieldValue) => void} />;
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
