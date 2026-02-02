/**
 * Features Module v1
 * Grid of features with icons, titles and descriptions
 */

import { z } from 'zod';

import type { ModuleDefinition } from '../../types';

// =====================================================
// Config Schema
// =====================================================

const featureItemSchema = z.object({
  icon: z.string().default('Star'),
  title: z.string().min(1),
  description: z.string().optional(),
});

export const featuresV1ConfigSchema = z.object({
  /** Section title */
  title: z.string().optional(),
  /** Section subtitle */
  subtitle: z.string().optional(),
  /** Feature items */
  features: z.array(featureItemSchema).default([]),
  /** Grid columns */
  columns: z.enum(['2', '3', '4']).default('3'),
  /** Icon style */
  iconStyle: z.enum(['circle', 'square', 'none']).default('circle'),
  /** Text alignment */
  alignment: z.enum(['left', 'center']).default('center'),
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
// Render Component
// =====================================================

const iconMap: Record<string, string> = {
  Zap: '⚡',
  Shield: '🛡️',
  HeadphonesIcon: '🎧',
  Star: '⭐',
  Heart: '❤️',
  Check: '✓',
  Clock: '🕐',
  Gift: '🎁',
  Truck: '🚚',
  Award: '🏆',
};

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

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        {(config.title || config.subtitle) && (
          <div className={`mb-12 ${config.alignment === 'center' ? 'text-center' : ''}`}>
            {config.title && (
              <h2 className="text-3xl font-bold md:text-4xl">{config.title}</h2>
            )}
            {config.subtitle && (
              <p className="mt-3 text-lg text-muted-foreground">{config.subtitle}</p>
            )}
          </div>
        )}

        {/* Features Grid */}
        <div className={`grid gap-8 ${gridCols[config.columns]}`}>
          {config.features.map((feature, index) => (
            <div
              key={index}
              className={`${config.alignment === 'center' ? 'text-center' : ''}`}
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
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Alt Başlık</label>
        <input
          type="text"
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Sütun Sayısı</label>
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
        <div>
          <label className="mb-1 block text-sm font-medium">Hizalama</label>
          <select
            value={config.alignment}
            onChange={(e) =>
              onChange({ ...config, alignment: e.target.value as 'left' | 'center' })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="center">Ortalı</option>
            <option value="left">Sola</option>
          </select>
        </div>
      </div>

      {/* Features List */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Özellikler</label>
          <button
            type="button"
            onClick={addFeature}
            className="text-sm text-primary hover:underline"
          >
            + Ekle
          </button>
        </div>
        <div className="space-y-3">
          {config.features.map((feature, index) => (
            <div key={index} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Özellik {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="text-sm text-destructive hover:underline"
                >
                  Sil
                </button>
              </div>
              <input
                type="text"
                placeholder="Başlık"
                value={feature.title}
                onChange={(e) => updateFeature(index, 'title', e.target.value)}
                className="mb-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Açıklama"
                value={feature.description || ''}
                onChange={(e) => updateFeature(index, 'description', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
