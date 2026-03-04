/**
 * CTA (Call to Action) Module v1
 * Banner with call to action buttons
 */

import * as React from 'react';

import { z } from 'zod';

import type { ModuleDefinition } from '../../types';
import { backgroundConfigSchema } from '../../types';

// =====================================================
// Config Schema
// =====================================================

const ctaButtonSchema = z.object({
  id: z.string().optional(),
  text: z.string(),
  link: z.string(),
  variant: z.enum(['white', 'outline', 'ghost']).default('white'),
  newTab: z.boolean().optional(),
});

const ctaTextStyleSchema = z.object({
  fontWeight: z.enum(['normal', 'medium', 'semibold', 'bold', 'extrabold']).optional(),
  fontStyle: z.enum(['normal', 'italic']).optional(),
  textDecoration: z.enum(['none', 'underline', 'line-through']).optional(),
  color: z.string().optional(),
});

const positionSchema = z.object({
  x: z.number().min(0).max(100).default(50),
  y: z.number().min(0).max(100).default(50),
});

export const ctaV1ConfigSchema = z.object({
  /** Title */
  title: z.string().min(1),
  /** Description */
  description: z.string().optional(),
  /** Buttons (new system) */
  buttons: z.array(ctaButtonSchema).default([]),
  /** Primary button text (legacy) */
  primaryButtonText: z.string().optional(),
  /** Primary button link (legacy) */
  primaryButtonLink: z.string().optional(),
  /** Secondary button text (legacy) */
  secondaryButtonText: z.string().optional(),
  /** Secondary button link (legacy) */
  secondaryButtonLink: z.string().optional(),
  /** Background settings */
  background: backgroundConfigSchema.default({ type: 'gradient', gradient: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)' }),
  /** Legacy: Background style */
  style: z.enum(['solid', 'gradient', 'image']).optional(),
  /** Legacy: Background color */
  backgroundColor: z.string().optional(),
  /** Legacy: Background image */
  backgroundImage: z.string().optional(),
  /** Legacy: Overlay opacity */
  overlayOpacity: z.number().optional(),
  /** Alignment */
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  /** Title text style */
  titleStyle: ctaTextStyleSchema.optional(),
  /** Description text style */
  descriptionStyle: ctaTextStyleSchema.optional(),
  /** Title drag position */
  titlePosition: positionSchema.optional(),
  /** Description drag position */
  descriptionPosition: positionSchema.optional(),
  /** Buttons drag position */
  buttonsPosition: positionSchema.optional(),
});

export type CtaV1Config = z.infer<typeof ctaV1ConfigSchema>;

type CtaButton = z.infer<typeof ctaButtonSchema>;

// =====================================================
// Default Config
// =====================================================

export const ctaV1DefaultConfig: CtaV1Config = {
  title: 'Bugün Siparişinizi Verin!',
  description:
    'En taze çiçekler, en özel anlarınız için. İlk siparişinizde %10 indirim fırsatını kaçırmayın.',
  buttons: [
    { id: 'cta-1', text: 'Alışverişe Başla', link: '/urunler', variant: 'white' },
    { id: 'cta-2', text: 'Daha Fazla Bilgi', link: '/hakkimizda', variant: 'outline' },
  ],
  background: {
    type: 'gradient',
    gradient: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)',
    overlayOpacity: 0,
  },
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
// Helpers
// =====================================================

function resolveCtaButtons(config: CtaV1Config): CtaButton[] {
  if (config.buttons && config.buttons.length > 0) return config.buttons;
  const btns: CtaButton[] = [];
  if (config.primaryButtonText) btns.push({ id: 'legacy-1', text: config.primaryButtonText, link: config.primaryButtonLink || '#', variant: 'white' });
  if (config.secondaryButtonText) btns.push({ id: 'legacy-2', text: config.secondaryButtonText, link: config.secondaryButtonLink || '#', variant: 'outline' });
  return btns;
}

/** Resolve background: new system (background obj) or legacy (style/backgroundColor/backgroundImage) */
function resolveCtaBackground(config: CtaV1Config): import('../../shared/background-picker').BackgroundConfig {
  // New system takes precedence
  if (config.background && config.background.type !== 'none') return config.background as import('../../shared/background-picker').BackgroundConfig;
  // Legacy migration
  if (config.style === 'solid') return { type: 'color', color: config.backgroundColor || 'hsl(var(--primary))' };
  if (config.style === 'image' && config.backgroundImage) return { type: 'image', image: { src: config.backgroundImage, alt: '' }, overlayOpacity: config.overlayOpacity ?? 50 };
  if (config.style === 'gradient') return { type: 'gradient', gradient: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)' };
  return config.background as import('../../shared/background-picker').BackgroundConfig || { type: 'gradient', gradient: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)' };
}

const btnVariantClasses: Record<string, string> = {
  white: 'bg-white text-primary font-semibold hover:scale-105',
  outline: 'border-2 border-white text-white font-semibold hover:bg-white/10',
  ghost: 'text-white font-semibold hover:bg-white/10 underline-offset-4 hover:underline',
};

/** Build CSS classes from cta text style */
const twFontWeight: Record<string, string> = { normal: 'font-normal', medium: 'font-medium', semibold: 'font-semibold', bold: 'font-bold', extrabold: 'font-extrabold' };
const twFontStyle: Record<string, string> = { normal: 'not-italic', italic: 'italic' };
const twDecoration: Record<string, string> = { none: 'no-underline', underline: 'underline', 'line-through': 'line-through' };

function buildCtaTextClass(style?: CtaV1Config['titleStyle']) {
  if (!style) return '';
  return [
    style.fontWeight ? twFontWeight[style.fontWeight] : '',
    style.fontStyle ? twFontStyle[style.fontStyle] : '',
    style.textDecoration ? twDecoration[style.textDecoration] : '',
  ].filter(Boolean).join(' ');
}

// =====================================================
// Render Component
// =====================================================

function CtaV1Render({
  block,
  isPreview,
}: {
  block: { config: CtaV1Config; id?: string };
  isPreview?: boolean;
}) {
  const { config } = block;
  const buttons = resolveCtaButtons(config);
  const bg = resolveCtaBackground(config);

  // Drag positioning support
  const onCfg = isPreview && typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>).__bloomBlockConfigChange as ((blockId: string, cfg: Record<string, unknown>) => void) | undefined : undefined;
  const blockId = (block as Record<string, unknown>).id as string | undefined;
  const canDrag = isPreview && !!onCfg && !!blockId;

  const updatePos = (key: string) => (pos: { x: number; y: number }) => {
    if (canDrag) onCfg!(blockId!, { ...config, [key]: pos } as unknown as Record<string, unknown>);
  };

  const alignmentClasses: Record<string, string> = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const bgStyle = (() => {
    const { getBackgroundStyle } = require('../../shared/background-picker') as { getBackgroundStyle: typeof import('../../shared/background-picker').getBackgroundStyle };
    return getBackgroundStyle(bg);
  })();

  // Fallback gradient if nothing is set
  const finalStyle = Object.keys(bgStyle).length === 0
    ? { background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)' }
    : bgStyle;

  return (
    <section className="py-4 px-4 md:px-8">
      <div
        className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl px-8 py-16 md:px-16 md:py-20"
        style={finalStyle}
      >
        {/* Overlay */}
        {(bg.overlayOpacity ?? 0) > 0 && (
          <div className="absolute inset-0 bg-black" style={{ opacity: (bg.overlayOpacity ?? 0) / 100 }} />
        )}

        <div className={`relative z-10 flex flex-col ${alignmentClasses[config.alignment]}`}>
          <CtaDraggableBox
            position={config.titlePosition}
            onPositionChange={canDrag ? updatePos('titlePosition') : undefined}
            isPreview={!!isPreview}
          >
            <h2 className={`text-3xl font-bold text-white md:text-4xl lg:text-5xl ${buildCtaTextClass(config.titleStyle)}`}
              style={config.titleStyle?.color ? { color: config.titleStyle.color } : undefined}
            >
              {config.title}
            </h2>
          </CtaDraggableBox>

          {config.description && (
            <CtaDraggableBox
              position={config.descriptionPosition}
              onPositionChange={canDrag ? updatePos('descriptionPosition') : undefined}
              isPreview={!!isPreview}
            >
              <p className={`mt-4 max-w-2xl text-lg text-white/90 md:text-xl ${buildCtaTextClass(config.descriptionStyle)}`}
                style={config.descriptionStyle?.color ? { color: config.descriptionStyle.color } : undefined}
              >
                {config.description}
              </p>
            </CtaDraggableBox>
          )}

          {buttons.length > 0 && (
            <CtaDraggableBox
              position={config.buttonsPosition}
              onPositionChange={canDrag ? updatePos('buttonsPosition') : undefined}
              isPreview={!!isPreview}
            >
              <div className={`mt-8 flex flex-col gap-4 sm:flex-row ${
                config.alignment === 'center' ? 'justify-center' : config.alignment === 'right' ? 'justify-end' : ''
              }`}>
                {buttons.map((btn, i) => {
                  const cls = `inline-flex items-center justify-center rounded-lg px-6 py-3 transition-transform ${btnVariantClasses[btn.variant || 'white']}`;
                  return isPreview ? (
                    <span key={btn.id || i} className={cls} role="button" tabIndex={0}>{btn.text}</span>
                  ) : (
                    <a key={btn.id || i} href={btn.link} className={cls} target={btn.newTab ? '_blank' : undefined} rel={btn.newTab ? 'noopener noreferrer' : undefined}>{btn.text}</a>
                  );
                })}
              </div>
            </CtaDraggableBox>
          )}
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
  const [showAddBtn, setShowAddBtn] = React.useState(false);
  const buttons = resolveCtaButtons(config);

  const updateButtons = (newBtns: CtaButton[]) => {
    onChange({ ...config, buttons: newBtns, primaryButtonText: undefined, primaryButtonLink: undefined, secondaryButtonText: undefined, secondaryButtonLink: undefined });
  };

  const addButton = (variant: string) => {
    const labels: Record<string, string> = { white: 'Beyaz Buton', outline: 'Çerçeveli Buton', ghost: 'Hayalet Buton' };
    updateButtons([...buttons, { id: `cta-${Date.now()}`, text: labels[variant] || 'Buton', link: '/', variant: variant as CtaButton['variant'] }]);
    setShowAddBtn(false);
  };

  const removeButton = (index: number) => updateButtons(buttons.filter((_, i) => i !== index));
  const updateButton = (index: number, updates: Partial<CtaButton>) => {
    const newBtns = [...buttons];
    newBtns[index] = { ...newBtns[index], ...updates };
    updateButtons(newBtns);
  };

  const inputCls = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm';
  const labelCls = 'mb-1 block text-sm font-medium';

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className={labelCls}>Başlık</label>
        <input type="text" value={config.title} onChange={(e) => onChange({ ...config, title: e.target.value })} className={inputCls} />
        <div className="mt-2">
          <CtaTextStyleField
            value={config.titleStyle || {}}
            onChange={(s) => onChange({ ...config, titleStyle: { ...config.titleStyle, ...s } })}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Açıklama</label>
        <textarea value={config.description || ''} onChange={(e) => onChange({ ...config, description: e.target.value })} className={inputCls} rows={3} />
        <div className="mt-2">
          <CtaTextStyleField
            value={config.descriptionStyle || {}}
            onChange={(s) => onChange({ ...config, descriptionStyle: { ...config.descriptionStyle, ...s } })}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Hizalama</label>
        <select value={config.alignment} onChange={(e) => onChange({ ...config, alignment: e.target.value as 'left' | 'center' | 'right' })} className={inputCls}>
          <option value="left">Sol</option>
          <option value="center">Orta</option>
          <option value="right">Sağ</option>
        </select>
      </div>

      {/* Background Picker */}
      <CtaBackgroundPicker
        value={resolveCtaBackground(config)}
        onChange={(bg) => onChange({ ...config, background: bg as CtaV1Config['background'], style: undefined, backgroundColor: undefined, backgroundImage: undefined, overlayOpacity: undefined })}
      />

      {/* Buttons */}
      <div className="border-t pt-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold">Butonlar</label>
          <div className="relative">
            <button type="button" onClick={() => setShowAddBtn(!showAddBtn)} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
              + Buton Ekle
            </button>
            {showAddBtn && (
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border bg-card shadow-lg">
                <div className="p-1">
                  {[
                    { variant: 'white', label: 'Beyaz Buton', preview: 'bg-white text-primary' },
                    { variant: 'outline', label: 'Çerçeveli Buton', preview: 'border-2 border-input' },
                    { variant: 'ghost', label: 'Hayalet (Link)', preview: 'underline' },
                  ].map((item) => (
                    <button key={item.variant} type="button" onClick={() => addButton(item.variant)} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-accent">
                      <span className={`inline-flex h-7 items-center rounded px-2 text-xs ${item.preview}`}>Aa</span>
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {buttons.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">Henüz buton eklenmemiş</p>}

        <div className="space-y-3">
          {buttons.map((btn, index) => (
            <div key={btn.id || index} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{btn.text}</span>
                <button type="button" onClick={() => removeButton(index)} className="rounded p-1 text-destructive hover:bg-destructive/10">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-2">
                <input type="text" value={btn.text} onChange={(e) => updateButton(index, { text: e.target.value })} className={inputCls} placeholder="Buton metni" />
                <input type="text" value={btn.link} onChange={(e) => updateButton(index, { link: e.target.value })} className={inputCls} placeholder="/urunler veya #iletisim" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={btn.variant || 'white'} onChange={(e) => updateButton(index, { variant: e.target.value as CtaButton['variant'] })} className={inputCls}>
                    <option value="white">Beyaz</option>
                    <option value="outline">Çerçeveli</option>
                    <option value="ghost">Hayalet</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={btn.newTab || false} onChange={(e) => updateButton(index, { newTab: e.target.checked })} className="rounded" />
                    Yeni sekmede
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
// Background Picker Wrapper
// =====================================================

function CtaBackgroundPicker({ value, onChange }: { value: import('../../shared/background-picker').BackgroundConfig; onChange: (bg: import('../../shared/background-picker').BackgroundConfig) => void }) {
  const { BackgroundPicker } = require('../../shared/background-picker') as { BackgroundPicker: typeof import('../../shared/background-picker').BackgroundPicker };
  return <BackgroundPicker value={value} onChange={onChange} imageFolder="cta" />;
}

function CtaTextStyleField({ value, onChange }: { value: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) {
  const { TextStyleField } = require('../../shared/text-style-field') as typeof import('../../shared/text-style-field');
  return <TextStyleField value={value as import('../../shared/text-style-field').TextStyleFieldValue} onChange={onChange as (v: import('../../shared/text-style-field').TextStyleFieldValue) => void} />;
}

function CtaDraggableBox(props: { children: React.ReactNode; position?: { x: number; y: number } | null; onPositionChange?: (pos: { x: number; y: number }) => void; isPreview: boolean }) {
  const { DraggableTextBox } = require('../../shared/draggable-text-box') as typeof import('../../shared/draggable-text-box');
  return <DraggableTextBox {...props} />;
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
