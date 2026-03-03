/**
 * Stats Module v1
 * Statistics/counters section
 */

import { z } from 'zod';

import { backgroundConfigSchema, type ModuleDefinition } from '../../types';

// =====================================================
// Config Schema
// =====================================================

const statItemSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

const statsTextStyleSchema = z.object({
  fontWeight: z.enum(['normal', 'medium', 'semibold', 'bold', 'extrabold']).optional(),
  fontStyle: z.enum(['normal', 'italic']).optional(),
  textDecoration: z.enum(['none', 'underline', 'line-through']).optional(),
  color: z.string().optional(),
});

export const statsV1ConfigSchema = z.object({
  /** Section title */
  title: z.string().optional(),
  /** Section title style */
  sectionTitleStyle: statsTextStyleSchema.optional(),
  /** Section subtitle */
  subtitle: z.string().optional(),
  /** Section subtitle style */
  sectionSubtitleStyle: statsTextStyleSchema.optional(),
  /** Stat items */
  stats: z.array(statItemSchema).default([]),
  /** Layout style */
  layout: z.enum(['row', 'grid']).default('row'),
  /** Style variant */
  variant: z.enum(['default', 'cards', 'minimal']).default('default'),
  /** Background */
  background: backgroundConfigSchema.default({ type: 'none' }),
});

export type StatsV1Config = z.infer<typeof statsV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const statsV1DefaultConfig: StatsV1Config = {
  title: '',
  subtitle: '',
  stats: [
    { value: '10000', label: 'Mutlu Müşteri', suffix: '+' },
    { value: '500', label: 'Ürün Çeşidi', suffix: '+' },
    { value: '15', label: 'Yıllık Deneyim' },
    { value: '24', label: 'Saat Teslimat', suffix: '/7' },
  ],
  layout: 'row',
  variant: 'default',
  background: { type: 'none' as const },
};

// =====================================================
// Module Metadata
// =====================================================

export const statsV1Meta = {
  id: 'stats.v1',
  name: 'İstatistikler',
  description: 'Sayaç ve istatistik gösterimi',
  category: 'content' as const,
  icon: 'TrendingUp',
  version: '1.0.0',
  tags: ['stats', 'numbers', 'counters', 'metrics'],
};

// =====================================================
// Render Component
// =====================================================

function StatsV1Render({
  block,
}: {
  block: { config: StatsV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;

  const { getBackgroundStyle, needsOverlay } = require('../../shared/background-picker') as typeof import('../../shared/background-picker');
  const bgStyle = getBackgroundStyle(config.background as import('../../shared/background-picker').BackgroundConfig);
  const showOverlay = needsOverlay(config.background as import('../../shared/background-picker').BackgroundConfig);

  const twFW: Record<string, string> = { normal: 'font-normal', medium: 'font-medium', semibold: 'font-semibold', bold: 'font-bold', extrabold: 'font-extrabold' };
  const twFS: Record<string, string> = { normal: 'not-italic', italic: 'italic' };
  const twDec: Record<string, string> = { none: 'no-underline', underline: 'underline', 'line-through': 'line-through' };
  type StTS = { fontWeight?: string; fontStyle?: string; textDecoration?: string; color?: string };
  const bld = (s?: StTS) => !s ? '' : [s.fontWeight && twFW[s.fontWeight], s.fontStyle && twFS[s.fontStyle], s.textDecoration && twDec[s.textDecoration]].filter(Boolean).join(' ');

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
              <h2 className={`text-3xl font-bold md:text-4xl ${bld(config.sectionTitleStyle)}`}
                style={config.sectionTitleStyle?.color ? { color: config.sectionTitleStyle.color } : undefined}
              >{config.title}</h2>
            )}
            {config.subtitle && (
              <p className={`mt-3 text-lg text-muted-foreground ${bld(config.sectionSubtitleStyle)}`}
                style={config.sectionSubtitleStyle?.color ? { color: config.sectionSubtitleStyle.color } : undefined}
              >
                {config.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        <div
          className={`${
            config.layout === 'row'
              ? 'flex flex-wrap items-center justify-center gap-8 md:gap-16'
              : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {config.stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center ${
                config.variant === 'cards'
                  ? 'rounded-xl border bg-card p-6 shadow-sm'
                  : ''
              }`}
            >
              <div
                className={`text-4xl font-bold md:text-5xl text-primary`}
              >
                {stat.prefix}
                {stat.value}
                {stat.suffix}
              </div>
              <div
                className="mt-2 text-sm font-medium text-muted-foreground"
              >
                {stat.label}
              </div>
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

function StatsV1Editor({
  config,
  onChange,
}: {
  config: StatsV1Config;
  onChange: (config: StatsV1Config) => void;
}) {
  const addStat = () => {
    onChange({
      ...config,
      stats: [...config.stats, { value: '0', label: 'Yeni İstatistik' }],
    });
  };

  const removeStat = (index: number) => {
    onChange({
      ...config,
      stats: config.stats.filter((_, i) => i !== index),
    });
  };

  const updateStat = (
    index: number,
    field: keyof typeof config.stats[number],
    value: string
  ) => {
    const newStats = [...config.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    onChange({ ...config, stats: newStats });
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
          <StatsTextStyleField
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
          <StatsTextStyleField
            value={config.sectionSubtitleStyle || {}}
            onChange={(s) => onChange({ ...config, sectionSubtitleStyle: { ...config.sectionSubtitleStyle, ...s } })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Düzen</label>
          <select
            value={config.layout}
            onChange={(e) =>
              onChange({ ...config, layout: e.target.value as 'row' | 'grid' })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="row">Satır</option>
            <option value="grid">Grid</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Stil</label>
          <select
            value={config.variant}
            onChange={(e) =>
              onChange({
                ...config,
                variant: e.target.value as 'default' | 'cards' | 'minimal',
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="default">Varsayılan</option>
            <option value="cards">Kartlar</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>

      {/* Background */}
      <StatsBackgroundPicker
        value={config.background as import('../../shared/background-picker').BackgroundConfig}
        onChange={(bg: import('../../shared/background-picker').BackgroundConfig) => onChange({ ...config, background: bg })}
      />

      {/* Stats List */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">İstatistikler</label>
          <button
            type="button"
            onClick={addStat}
            className="text-sm text-primary hover:underline"
          >
            + Ekle
          </button>
        </div>
        <div className="space-y-3">
          {config.stats.map((stat, index) => (
            <div key={index} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">İstatistik {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeStat(index)}
                  className="text-sm text-destructive hover:underline"
                >
                  Sil
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Değer"
                  value={stat.value}
                  onChange={(e) => updateStat(index, 'value', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Etiket"
                  value={stat.label}
                  onChange={(e) => updateStat(index, 'label', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Önek (örn: ₺)"
                  value={stat.prefix || ''}
                  onChange={(e) => updateStat(index, 'prefix', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Sonek (örn: +, %)"
                  value={stat.suffix || ''}
                  onChange={(e) => updateStat(index, 'suffix', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Background picker wrapper */
function StatsBackgroundPicker(props: { value: import('../../shared/background-picker').BackgroundConfig; onChange: (bg: import('../../shared/background-picker').BackgroundConfig) => void }) {
  const { BackgroundPicker } = require('../../shared/background-picker') as typeof import('../../shared/background-picker');
  return <BackgroundPicker value={props.value} onChange={props.onChange} imageFolder="stats" />;
}

function StatsTextStyleField({ value, onChange }: { value: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) {
  const { TextStyleField } = require('../../shared/text-style-field') as typeof import('../../shared/text-style-field');
  return <TextStyleField value={value as import('../../shared/text-style-field').TextStyleFieldValue} onChange={onChange as (v: import('../../shared/text-style-field').TextStyleFieldValue) => void} />;
}

// =====================================================
// Module Definition
// =====================================================

export const statsV1Module: ModuleDefinition<StatsV1Config> = {
  meta: statsV1Meta,
  configSchema: statsV1ConfigSchema,
  defaultConfig: statsV1DefaultConfig,
  Render: StatsV1Render,
  Editor: StatsV1Editor,
};
