/**
 * Features Module v1
 * Grid of features with icons, titles and descriptions
 */

import { z } from 'zod';

import type { ModuleDefinition } from '../../types';
import { backgroundConfigSchema } from '../../types';

// =====================================================
// Config Schema
// =====================================================

const featureItemSchema = z.object({
  icon: z.string().default('Star'),
  title: z.string().min(1),
  description: z.string().optional(),
});

const featuresTextStyleSchema = z.object({
  fontWeight: z.enum(['normal', 'medium', 'semibold', 'bold', 'extrabold']).optional(),
  fontStyle: z.enum(['normal', 'italic']).optional(),
  textDecoration: z.enum(['none', 'underline', 'line-through']).optional(),
  color: z.string().optional(),
});

export const featuresV1ConfigSchema = z.object({
  /** Section title */
  title: z.string().optional(),
  /** Section title style */
  sectionTitleStyle: featuresTextStyleSchema.optional(),
  /** Section subtitle */
  subtitle: z.string().optional(),
  /** Section subtitle style */
  sectionSubtitleStyle: featuresTextStyleSchema.optional(),
  /** Feature items */
  features: z.array(featureItemSchema).default([]),
  /** Grid columns */
  columns: z.enum(['2', '3', '4']).default('3'),
  /** Icon style */
  iconStyle: z.enum(['circle', 'square', 'none']).default('circle'),
  /** Text alignment */
  alignment: z.enum(['left', 'center']).default('center'),
  /** Background */
  background: backgroundConfigSchema.default({ type: 'none' }),
  /** Card style */
  cardStyle: z.enum(['flat', 'bordered', 'shadow']).default('flat'),
});

export type FeaturesV1Config = z.infer<typeof featuresV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const featuresV1DefaultConfig: FeaturesV1Config = {
  title: 'Özelliklerimiz',
  subtitle: 'Size en iyi hizmeti sunmak için buradayız',
  features: [
    {
      icon: 'Zap',
      title: 'Hızlı Teslimat',
      description: 'Siparişleriniz aynı gün kargoya verilir',
    },
    {
      icon: 'Shield',
      title: 'Güvenli Alışveriş',
      description: '256-bit SSL şifreleme ile güvenli ödeme',
    },
    {
      icon: 'HeadphonesIcon',
      title: '7/24 Destek',
      description: 'Her zaman yanınızdayız',
    },
  ],
  columns: '3',
  iconStyle: 'circle',
  alignment: 'center',
  background: { type: 'none' },
  cardStyle: 'flat',
};

// =====================================================
// Module Metadata
// =====================================================

export const featuresV1Meta = {
  id: 'features.v1',
  name: 'Özellikler',
  description: 'İkon, başlık ve açıklama içeren özellik kartları',
  category: 'content' as const,
  icon: 'LayoutGrid',
  version: '1.0.0',
  tags: ['features', 'grid', 'icons', 'services'],
};

// =====================================================
// Icon Map
// =====================================================

const iconMap: Record<string, string> = {
  // General
  Star: '⭐',
  Heart: '❤️',
  Check: '✓',
  Award: '🏆',
  Zap: '⚡',
  Target: '🎯',
  Flag: '🚩',
  Bookmark: '🔖',
  // Commerce
  Truck: '🚚',
  Gift: '🎁',
  ShoppingBag: '🛍️',
  CreditCard: '💳',
  Tag: '🏷️',
  Package: '📦',
  // Communication
  HeadphonesIcon: '🎧',
  Phone: '📞',
  Mail: '📧',
  MessageCircle: '💬',
  Bell: '🔔',
  // Flora
  Flower: '🌸',
  Leaf: '🍃',
  TreePine: '🌲',
  Sun: '☀️',
  Droplets: '💧',
  Sprout: '🌱',
  // Security
  Shield: '🛡️',
  Lock: '🔒',
  Eye: '👁️',
  Key: '🔑',
  // Time
  Clock: '🕐',
  Calendar: '📅',
  Timer: '⏱️',
  // Technology
  Globe: '🌐',
  Wifi: '📶',
  Monitor: '🖥️',
  Smartphone: '📱',
  Camera: '📷',
  // Business
  Users: '👥',
  Building: '🏢',
  Briefcase: '💼',
  ChartBar: '📊',
  TrendingUp: '📈',
  // Misc
  Sparkles: '✨',
  ThumbsUp: '👍',
  Smile: '😊',
  Coffee: '☕',
  Music: '🎵',
  Palette: '🎨',
  Compass: '🧭',
  Map: '🗺️',
  Rocket: '🚀',
};

// Group icons by category for better UX  
const iconCategories = [
  { label: '— Genel —', icons: ['Star', 'Heart', 'Check', 'Award', 'Zap', 'Target', 'Flag', 'Bookmark'] },
  { label: '— Ticaret —', icons: ['Truck', 'Gift', 'ShoppingBag', 'CreditCard', 'Tag', 'Package'] },
  { label: '— İletişim —', icons: ['HeadphonesIcon', 'Phone', 'Mail', 'MessageCircle', 'Bell'] },
  { label: '— Flora —', icons: ['Flower', 'Leaf', 'TreePine', 'Sun', 'Droplets', 'Sprout'] },
  { label: '— Güvenlik —', icons: ['Shield', 'Lock', 'Eye', 'Key'] },
  { label: '— Zaman —', icons: ['Clock', 'Calendar', 'Timer'] },
  { label: '— Teknoloji —', icons: ['Globe', 'Wifi', 'Monitor', 'Smartphone', 'Camera'] },
  { label: '— İş —', icons: ['Users', 'Building', 'Briefcase', 'ChartBar', 'TrendingUp'] },
  { label: '— Diğer —', icons: ['Sparkles', 'ThumbsUp', 'Smile', 'Coffee', 'Music', 'Palette', 'Compass', 'Map', 'Rocket'] },
];

// =====================================================
const twFW: Record<string, string> = { normal: 'font-normal', medium: 'font-medium', semibold: 'font-semibold', bold: 'font-bold', extrabold: 'font-extrabold' };
const twFS: Record<string, string> = { normal: 'not-italic', italic: 'italic' };
const twDec: Record<string, string> = { none: 'no-underline', underline: 'underline', 'line-through': 'line-through' };
type FeatTextStyle = { fontWeight?: string; fontStyle?: string; textDecoration?: string; color?: string };
function buildFeatTextClass(s?: FeatTextStyle) {
  if (!s) return '';
  return [s.fontWeight && twFW[s.fontWeight], s.fontStyle && twFS[s.fontStyle], s.textDecoration && twDec[s.textDecoration]].filter(Boolean).join(' ');
}

// Render Component
// =====================================================

function FeaturesV1Render({
  block,
}: {
  block: { config: FeaturesV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;

  const gridCols: Record<string, string> = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-3',
    '4': 'md:grid-cols-2 lg:grid-cols-4',
  };

  const bgStyle = (() => {
    const { getBackgroundStyle } = require('../../shared/background-picker') as { getBackgroundStyle: typeof import('../../shared/background-picker').getBackgroundStyle };
    return getBackgroundStyle(config.background as import('../../shared/background-picker').BackgroundConfig);
  })();
  const hasBgOverlay = typeof config.background === 'object' && (config.background as import('../../shared/background-picker').BackgroundConfig).overlayOpacity;

  return (
    <section className="relative py-16 px-4 md:px-8" style={bgStyle}>
      {hasBgOverlay ? (
        <div className="absolute inset-0 bg-black" style={{ opacity: ((config.background as import('../../shared/background-picker').BackgroundConfig).overlayOpacity ?? 0) / 100 }} />
      ) : null}
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        {(config.title || config.subtitle) && (
          <div className={`mb-12 ${config.alignment === 'center' ? 'text-center' : ''}`}>
            {config.title && (
              <h2 className={`text-3xl font-bold md:text-4xl ${buildFeatTextClass(config.sectionTitleStyle)}`}
                style={config.sectionTitleStyle?.color ? { color: config.sectionTitleStyle.color } : undefined}
              >{config.title}</h2>
            )}
            {config.subtitle && (
              <p className={`mt-3 text-lg text-muted-foreground ${buildFeatTextClass(config.sectionSubtitleStyle)}`}
                style={config.sectionSubtitleStyle?.color ? { color: config.sectionSubtitleStyle.color } : undefined}
              >{config.subtitle}</p>
            )}
          </div>
        )}

        {/* Features Grid */}
        <div className={`grid gap-8 ${gridCols[config.columns]}`}>
          {config.features.map((feature, index) => (
            <div
              key={index}
              className={`${config.alignment === 'center' ? 'text-center' : ''} ${
                config.cardStyle === 'bordered' ? 'rounded-xl border bg-card p-6' :
                config.cardStyle === 'shadow' ? 'rounded-xl bg-card p-6 shadow-md' : ''
              }`}
            >
              {/* Icon */}
              {config.iconStyle !== 'none' && (
                <div
                  className={`mb-4 inline-flex h-14 w-14 items-center justify-center text-2xl ${
                    config.iconStyle === 'circle'
                      ? 'rounded-full bg-primary/10 text-primary'
                      : 'rounded-lg bg-primary/10 text-primary'
                  }`}
                >
                  {iconMap[feature.icon] || '✦'}
                </div>
              )}
              {/* Title */}
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              {/* Description */}
              {feature.description && (
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================================================
// Editor Component
// =====================================================

function FeaturesV1Editor({
  config,
  onChange,
}: {
  config: FeaturesV1Config;
  onChange: (config: FeaturesV1Config) => void;
}) {
  const addFeature = () => {
    onChange({
      ...config,
      features: [
        ...config.features,
        { icon: 'Star', title: 'Yeni Özellik', description: '' },
      ],
    });
  };

  const removeFeature = (index: number) => {
    onChange({
      ...config,
      features: config.features.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (
    index: number,
    field: keyof typeof config.features[number],
    value: string
  ) => {
    const newFeatures = [...config.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange({ ...config, features: newFeatures });
  };

  const moveFeature = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.features.length) return;
    const newFeatures = [...config.features];
    [newFeatures[index], newFeatures[newIndex]] = [newFeatures[newIndex], newFeatures[index]];
    onChange({ ...config, features: newFeatures });
  };

  const inputCls = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm';
  const labelCls = 'mb-1 block text-sm font-medium';

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className={labelCls}>Başlık</label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className={inputCls}
        />
        <div className="mt-2">
          <FeaturesTextStyleField
            value={config.sectionTitleStyle || {}}
            onChange={(s) => onChange({ ...config, sectionTitleStyle: { ...config.sectionTitleStyle, ...s } })}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Alt Başlık</label>
        <input
          type="text"
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
          className={inputCls}
        />
        <div className="mt-2">
          <FeaturesTextStyleField
            value={config.sectionSubtitleStyle || {}}
            onChange={(s) => onChange({ ...config, sectionSubtitleStyle: { ...config.sectionSubtitleStyle, ...s } })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Sütun</label>
          <select value={config.columns} onChange={(e) => onChange({ ...config, columns: e.target.value as '2' | '3' | '4' })} className={inputCls}>
            <option value="2">2 Sütun</option>
            <option value="3">3 Sütun</option>
            <option value="4">4 Sütun</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Hizalama</label>
          <select value={config.alignment} onChange={(e) => onChange({ ...config, alignment: e.target.value as 'left' | 'center' })} className={inputCls}>
            <option value="center">Ortalı</option>
            <option value="left">Sola</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>İkon Stili</label>
          <select value={config.iconStyle} onChange={(e) => onChange({ ...config, iconStyle: e.target.value as 'circle' | 'square' | 'none' })} className={inputCls}>
            <option value="circle">Daire</option>
            <option value="square">Kare</option>
            <option value="none">Yok</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Kart Stili</label>
          <select value={config.cardStyle} onChange={(e) => onChange({ ...config, cardStyle: e.target.value as 'flat' | 'bordered' | 'shadow' })} className={inputCls}>
            <option value="flat">Düz</option>
            <option value="bordered">Kenarlıklı</option>
            <option value="shadow">Gölgeli</option>
          </select>
        </div>
      </div>

      {/* Background Picker */}
      <FeaturesBackgroundPicker
        value={config.background as import('../../shared/background-picker').BackgroundConfig}
        onChange={(bg) => onChange({ ...config, background: bg as FeaturesV1Config['background'] })}
      />

      {/* Features List */}
      <div className="border-t pt-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold">Özellikler ({config.features.length})</label>
          <button
            type="button"
            onClick={addFeature}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Yeni Özellik
          </button>
        </div>
        <div className="space-y-3">
          {config.features.map((feature, index) => (
            <div key={index} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{iconMap[feature.icon] || '✦'}</span>
                  <span className="text-sm font-medium">{feature.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveFeature(index, 'up')} disabled={index === 0} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" title="Yukarı">↑</button>
                  <button type="button" onClick={() => moveFeature(index, 'down')} disabled={index === config.features.length - 1} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" title="Aşağı">↓</button>
                  <button type="button" onClick={() => removeFeature(index)} className="rounded p-1 text-destructive hover:bg-destructive/10" title="Sil">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="mb-0.5 block text-xs text-muted-foreground">İkon</label>
                  <select
                    value={feature.icon}
                    onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                    className={inputCls}
                  >
                    {iconCategories.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.icons.map((icon) => (
                          <option key={icon} value={icon}>
                            {iconMap[icon]} {icon}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Başlık"
                  value={feature.title}
                  onChange={(e) => updateFeature(index, 'title', e.target.value)}
                  className={inputCls}
                />
                <textarea
                  placeholder="Açıklama"
                  value={feature.description || ''}
                  onChange={(e) => updateFeature(index, 'description', e.target.value)}
                  className={inputCls}
                  rows={2}
                />
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

function FeaturesBackgroundPicker({ value, onChange }: { value: import('../../shared/background-picker').BackgroundConfig; onChange: (bg: import('../../shared/background-picker').BackgroundConfig) => void }) {
  const { BackgroundPicker } = require('../../shared/background-picker') as { BackgroundPicker: typeof import('../../shared/background-picker').BackgroundPicker };
  return <BackgroundPicker value={value} onChange={onChange} imageFolder="features" />;
}

function FeaturesTextStyleField({ value, onChange }: { value: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) {
  const { TextStyleField } = require('../../shared/text-style-field') as typeof import('../../shared/text-style-field');
  return <TextStyleField value={value as import('../../shared/text-style-field').TextStyleFieldValue} onChange={onChange as (v: import('../../shared/text-style-field').TextStyleFieldValue) => void} />;
}

// =====================================================
// Module Definition
// =====================================================

export const featuresV1Module: ModuleDefinition<FeaturesV1Config> = {
  meta: featuresV1Meta,
  configSchema: featuresV1ConfigSchema,
  defaultConfig: featuresV1DefaultConfig,
  Render: FeaturesV1Render,
  Editor: FeaturesV1Editor,
};
