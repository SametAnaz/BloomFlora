/**
 * Pricing Module v1
 * Pricing tables and plans
 */

import * as React from 'react';

import { z } from 'zod';

import { backgroundConfigSchema, type ModuleDefinition } from '../../types';

// =====================================================
// Config Schema
// =====================================================

const pricingFeatureSchema = z.object({
  text: z.string().min(1),
  included: z.boolean().default(true),
});

const pricingPlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.string().min(1),
  period: z.string().optional(),
  features: z.array(pricingFeatureSchema).default([]),
  highlighted: z.boolean().default(false),
  badge: z.string().optional(),
  buttonText: z.string().default('Seç'),
  buttonLink: z.string().optional(),
});

const pricingTextStyleSchema = z.object({
  fontWeight: z.enum(['normal', 'medium', 'semibold', 'bold', 'extrabold']).optional(),
  fontStyle: z.enum(['normal', 'italic']).optional(),
  textDecoration: z.enum(['none', 'underline', 'line-through']).optional(),
  color: z.string().optional(),
});

const positionSchema = z.object({
  x: z.number().min(0).max(100).default(50),
  y: z.number().min(0).max(100).default(50),
});

export const pricingV1ConfigSchema = z.object({
  /** Section title */
  title: z.string().optional(),
  /** Section title style */
  sectionTitleStyle: pricingTextStyleSchema.optional(),
  /** Section subtitle */
  subtitle: z.string().optional(),
  /** Section subtitle style */
  sectionSubtitleStyle: pricingTextStyleSchema.optional(),
  /** Title drag position */
  titlePosition: positionSchema.optional(),
  /** Subtitle drag position */
  subtitlePosition: positionSchema.optional(),
  /** Pricing plans */
  plans: z.array(pricingPlanSchema).default([]),
  /** Layout style */
  columns: z.enum(['2', '3', '4']).default('3'),
  /** Background */
  background: backgroundConfigSchema.default({ type: 'none' }),
});

export type PricingV1Config = z.infer<typeof pricingV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const pricingV1DefaultConfig: PricingV1Config = {
  title: 'Fiyatlandırma',
  subtitle: 'Size uygun planı seçin',
  plans: [
    {
      name: 'Başlangıç',
      description: 'Bireysel kullanım için',
      price: '₺99',
      period: '/ay',
      features: [
        { text: '5 Ürün', included: true },
        { text: 'Temel Destek', included: true },
        { text: 'Analitik', included: false },
        { text: 'Özel Domain', included: false },
      ],
      highlighted: false,
      buttonText: 'Başla',
    },
    {
      name: 'Profesyonel',
      description: 'Küçük işletmeler için',
      price: '₺249',
      period: '/ay',
      features: [
        { text: '50 Ürün', included: true },
        { text: 'Öncelikli Destek', included: true },
        { text: 'Gelişmiş Analitik', included: true },
        { text: 'Özel Domain', included: false },
      ],
      highlighted: true,
      badge: 'Popüler',
      buttonText: 'Başla',
    },
    {
      name: 'Kurumsal',
      description: 'Büyük işletmeler için',
      price: '₺499',
      period: '/ay',
      features: [
        { text: 'Sınırsız Ürün', included: true },
        { text: '7/24 Destek', included: true },
        { text: 'Tam Analitik', included: true },
        { text: 'Özel Domain', included: true },
      ],
      highlighted: false,
      buttonText: 'İletişime Geç',
    },
  ],
  columns: '3',
  background: { type: 'none' as const },
};

// =====================================================
// Module Metadata
// =====================================================

export const pricingV1Meta = {
  id: 'pricing.v1',
  name: 'Fiyat Tablosu',
  description: 'Fiyatlandırma planları ve karşılaştırma tablosu',
  category: 'catalog' as const,
  icon: 'BadgeDollarSign',
  version: '1.0.0',
  tags: ['pricing', 'plans', 'table', 'comparison'],
};

// =====================================================
// Render Component
// =====================================================

function PricingV1Render({
  block,
  isPreview,
}: {
  block: { config: PricingV1Config; id?: string };
  isPreview?: boolean;
}) {
  const { config } = block;

  // Drag positioning support
  const onCfg = isPreview && typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>).__bloomBlockConfigChange as ((blockId: string, cfg: Record<string, unknown>) => void) | undefined : undefined;
  const blockId = (block as Record<string, unknown>).id as string | undefined;
  const canDrag = isPreview && !!onCfg && !!blockId;

  const updatePos = (key: string) => (pos: { x: number; y: number }) => {
    if (canDrag) onCfg!(blockId!, { ...config, [key]: pos } as unknown as Record<string, unknown>);
  };

  const gridCols: Record<string, string> = {
    '2': 'md:grid-cols-2',
    '3': 'lg:grid-cols-3',
    '4': 'md:grid-cols-2 lg:grid-cols-4',
  };

  const { getBackgroundStyle, needsOverlay } = require('../../shared/background-picker') as typeof import('../../shared/background-picker');
  const bgStyle = getBackgroundStyle(config.background as import('../../shared/background-picker').BackgroundConfig);
  const showOverlay = needsOverlay(config.background as import('../../shared/background-picker').BackgroundConfig);

  const twFW: Record<string, string> = { normal: 'font-normal', medium: 'font-medium', semibold: 'font-semibold', bold: 'font-bold', extrabold: 'font-extrabold' };
  const twFS: Record<string, string> = { normal: 'not-italic', italic: 'italic' };
  const twDec: Record<string, string> = { none: 'no-underline', underline: 'underline', 'line-through': 'line-through' };
  type PriceTS = { fontWeight?: string; fontStyle?: string; textDecoration?: string; color?: string };
  const bld = (s?: PriceTS) => !s ? '' : [s.fontWeight && twFW[s.fontWeight], s.fontStyle && twFS[s.fontStyle], s.textDecoration && twDec[s.textDecoration]].filter(Boolean).join(' ');

  return (
    <section className="relative py-16 px-4 md:px-8" style={bgStyle}>
      {showOverlay && (
        <div className="absolute inset-0 bg-black/50" style={{ opacity: ((config.background as Record<string, unknown>)?.overlayOpacity as number ?? 40) / 100 }} />
      )}
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        {(config.title || config.subtitle) && (
          <div className="mb-12 text-center">
            {config.title && (
              <PricingDraggableBox
                position={config.titlePosition}
                onPositionChange={canDrag ? updatePos('titlePosition') : undefined}
                isPreview={!!isPreview}
              >
                <h2 className={`text-3xl font-bold md:text-4xl ${bld(config.sectionTitleStyle)}`}
                  style={config.sectionTitleStyle?.color ? { color: config.sectionTitleStyle.color } : undefined}
                >{config.title}</h2>
              </PricingDraggableBox>
            )}
            {config.subtitle && (
              <PricingDraggableBox
                position={config.subtitlePosition}
                onPositionChange={canDrag ? updatePos('subtitlePosition') : undefined}
                isPreview={!!isPreview}
              >
                <p className={`mt-3 text-lg text-muted-foreground ${bld(config.sectionSubtitleStyle)}`}
                  style={config.sectionSubtitleStyle?.color ? { color: config.sectionSubtitleStyle.color } : undefined}
                >{config.subtitle}</p>
              </PricingDraggableBox>
            )}
          </div>
        )}

        {/* Plans */}
        <div className={`grid gap-6 ${gridCols[config.columns]}`}>
          {config.plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-xl border p-6 ${
                plan.highlighted
                  ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary'
                  : 'bg-card'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              {plan.description && (
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              )}

              {/* Price */}
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>

              {/* Features */}
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                        feature.included
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {feature.included ? '✓' : '✗'}
                    </span>
                    <span
                      className={
                        feature.included ? '' : 'text-muted-foreground line-through'
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                className={`mt-6 w-full rounded-lg py-2.5 font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-primary bg-transparent text-primary hover:bg-primary/10'
                }`}
              >
                {plan.buttonText}
              </button>
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

function PricingV1Editor({
  config,
  onChange,
}: {
  config: PricingV1Config;
  onChange: (config: PricingV1Config) => void;
}) {
  const addPlan = () => {
    onChange({
      ...config,
      plans: [
        ...config.plans,
        {
          name: 'Yeni Plan',
          price: '₺0',
          features: [],
          highlighted: false,
          buttonText: 'Seç',
        },
      ],
    });
  };

  const removePlan = (index: number) => {
    onChange({
      ...config,
      plans: config.plans.filter((_, i) => i !== index),
    });
  };

  const updatePlan = (
    index: number,
    field: keyof typeof config.plans[number],
    value: unknown
  ) => {
    const newPlans = [...config.plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    onChange({ ...config, plans: newPlans });
  };

  const addFeature = (planIndex: number) => {
    const newPlans = [...config.plans];
    newPlans[planIndex].features.push({ text: 'Yeni özellik', included: true });
    onChange({ ...config, plans: newPlans });
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    const newPlans = [...config.plans];
    newPlans[planIndex].features = newPlans[planIndex].features.filter(
      (_, i) => i !== featureIndex
    );
    onChange({ ...config, plans: newPlans });
  };

  const updateFeature = (
    planIndex: number,
    featureIndex: number,
    field: 'text' | 'included',
    value: string | boolean
  ) => {
    const newPlans = [...config.plans];
    newPlans[planIndex].features[featureIndex] = {
      ...newPlans[planIndex].features[featureIndex],
      [field]: value,
    };
    onChange({ ...config, plans: newPlans });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Başlık</label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <div className="mt-2">
          <PricingTextStyleField
            value={config.sectionTitleStyle || {}}
            onChange={(s) => onChange({ ...config, sectionTitleStyle: { ...config.sectionTitleStyle, ...s } })}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Alt Başlık</label>
        <input
          type="text"
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <div className="mt-2">
          <PricingTextStyleField
            value={config.sectionSubtitleStyle || {}}
            onChange={(s) => onChange({ ...config, sectionSubtitleStyle: { ...config.sectionSubtitleStyle, ...s } })}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Sütun</label>
        <select
          value={config.columns}
          onChange={(e) =>
            onChange({ ...config, columns: e.target.value as '2' | '3' | '4' })
          }
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="2">2 Sütun</option>
          <option value="3">3 Sütun</option>
          <option value="4">4 Sütun</option>
        </select>
      </div>

      {/* Background */}
      <PricingBackgroundPicker
        value={config.background as import('../../shared/background-picker').BackgroundConfig}
        onChange={(bg: import('../../shared/background-picker').BackgroundConfig) => onChange({ ...config, background: bg })}
      />

      {/* Plans List */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Planlar</label>
          <button
            type="button"
            onClick={addPlan}
            className="text-sm text-primary hover:underline"
          >
            + Ekle
          </button>
        </div>
        <div className="space-y-4">
          {config.plans.map((plan, index) => (
            <div key={index} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{plan.name}</span>
                <button
                  type="button"
                  onClick={() => removePlan(index)}
                  className="text-sm text-destructive hover:underline"
                >
                  Sil
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Plan Adı"
                  value={plan.name}
                  onChange={(e) => updatePlan(index, 'name', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Fiyat"
                    value={plan.price}
                    onChange={(e) => updatePlan(index, 'price', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Periyot"
                    value={plan.period || ''}
                    onChange={(e) => updatePlan(index, 'period', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={plan.highlighted}
                    onChange={(e) =>
                      updatePlan(index, 'highlighted', e.target.checked)
                    }
                  />
                  <span className="text-sm">Öne Çıkar</span>
                </label>

                {/* Features */}
                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Özellikler</span>
                    <button
                      type="button"
                      onClick={() => addFeature(index)}
                      className="text-xs text-primary hover:underline"
                    >
                      + Ekle
                    </button>
                  </div>
                  <div className="space-y-1">
                    {plan.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={feature.included}
                          onChange={(e) =>
                            updateFeature(index, fIndex, 'included', e.target.checked)
                          }
                        />
                        <input
                          type="text"
                          value={feature.text}
                          onChange={(e) =>
                            updateFeature(index, fIndex, 'text', e.target.value)
                          }
                          className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(index, fIndex)}
                          className="text-xs text-destructive"
                        >
                          ✗
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Background picker wrapper */
function PricingBackgroundPicker(props: { value: import('../../shared/background-picker').BackgroundConfig; onChange: (bg: import('../../shared/background-picker').BackgroundConfig) => void }) {
  const { BackgroundPicker } = require('../../shared/background-picker') as typeof import('../../shared/background-picker');
  return <BackgroundPicker value={props.value} onChange={props.onChange} imageFolder="pricing" />;
}

function PricingTextStyleField({ value, onChange }: { value: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) {
  const { TextStyleField } = require('../../shared/text-style-field') as typeof import('../../shared/text-style-field');
  return <TextStyleField value={value as import('../../shared/text-style-field').TextStyleFieldValue} onChange={onChange as (v: import('../../shared/text-style-field').TextStyleFieldValue) => void} />;
}

function PricingDraggableBox(props: { children: React.ReactNode; position?: { x: number; y: number } | null; onPositionChange?: (pos: { x: number; y: number }) => void; isPreview: boolean }) {
  const { DraggableTextBox } = require('../../shared/draggable-text-box') as typeof import('../../shared/draggable-text-box');
  return <DraggableTextBox {...props} />;
}

// =====================================================
// Module Definition
// =====================================================

export const pricingV1Module: ModuleDefinition<PricingV1Config> = {
  meta: pricingV1Meta,
  configSchema: pricingV1ConfigSchema,
  defaultConfig: pricingV1DefaultConfig,
  Render: PricingV1Render,
  Editor: PricingV1Editor,
};
