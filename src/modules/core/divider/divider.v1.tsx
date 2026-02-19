/**
 * Divider Module v1
 * Visual separator between sections
 */

import { z } from 'zod';

import { backgroundConfigSchema, type ModuleDefinition } from '../../types';

// =====================================================
// Config Schema
// =====================================================

export const dividerV1ConfigSchema = z.object({
  /** Divider style */
  style: z.enum(['line', 'dashed', 'dotted', 'gradient', 'icon']).default('line'),
  /** Icon for icon style */
  icon: z.string().optional(),
  /** Thickness */
  thickness: z.enum(['thin', 'medium', 'thick']).default('thin'),
  /** Width */
  width: z.enum(['full', '3/4', '1/2', '1/4']).default('full'),
  /** Color */
  color: z.enum(['muted', 'primary', 'custom']).default('muted'),
  /** Custom color */
  customColor: z.string().optional(),
  /** Vertical spacing */
  spacing: z.enum(['sm', 'md', 'lg', 'xl']).default('md'),
  /** Background */
  background: backgroundConfigSchema.default({ type: 'none' }),
});

export type DividerV1Config = z.infer<typeof dividerV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const dividerV1DefaultConfig: DividerV1Config = {
  style: 'line',
  thickness: 'thin',
  width: 'full',
  color: 'muted',
  spacing: 'md',
  background: { type: 'none' as const },
};

// =====================================================
// Module Metadata
// =====================================================

export const dividerV1Meta = {
  id: 'divider.v1',
  name: 'Ayırıcı',
  description: 'Bölümler arası görsel ayırıcı',
  category: 'utility' as const,
  icon: 'Minus',
  version: '1.0.0',
  tags: ['divider', 'separator', 'line', 'utility'],
};

// =====================================================
// Render Component
// =====================================================

function DividerV1Render({
  block,
}: {
  block: { config: DividerV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;

  const spacingClasses: Record<string, string> = {
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12',
    xl: 'py-16',
  };

  const widthClasses: Record<string, string> = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4',
  };

  const thicknessClasses: Record<string, string> = {
    thin: 'h-px',
    medium: 'h-0.5',
    thick: 'h-1',
  };

  const getColor = () => {
    switch (config.color) {
      case 'primary':
        return 'bg-primary';
      case 'custom':
        return '';
      default:
        return 'bg-border';
    }
  };

  const customStyle =
    config.color === 'custom' && config.customColor
      ? { backgroundColor: config.customColor }
      : {};

  const { getBackgroundStyle, needsOverlay } = require('../../shared/background-picker') as typeof import('../../shared/background-picker');
  const bgStyle = getBackgroundStyle(config.background as import('../../shared/background-picker').BackgroundConfig);
  const showOverlay = needsOverlay(config.background as import('../../shared/background-picker').BackgroundConfig);

  return (
    <div className={`relative ${spacingClasses[config.spacing]} px-4`} style={bgStyle}>
      {showOverlay && (
        <div className="absolute inset-0 bg-black/50" style={{ opacity: ((config.background as Record<string, unknown>)?.overlayOpacity as number ?? 40) / 100 }} />
      )}
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-center">
        {config.style === 'icon' ? (
          <div className="flex items-center gap-4">
            <div
              className={`${widthClasses[config.width]} ${thicknessClasses[config.thickness]} ${getColor()}`}
              style={customStyle}
            />
            <span className="text-2xl text-muted-foreground">
              {config.icon || '✦'}
            </span>
            <div
              className={`${widthClasses[config.width]} ${thicknessClasses[config.thickness]} ${getColor()}`}
              style={customStyle}
            />
          </div>
        ) : config.style === 'gradient' ? (
          <div
            className={`${widthClasses[config.width]} ${thicknessClasses[config.thickness]} rounded-full`}
            style={{
              background:
                'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
            }}
          />
        ) : (
          <div
            className={`${widthClasses[config.width]} ${thicknessClasses[config.thickness]} ${getColor()} ${
              config.style === 'dashed'
                ? 'border-t border-dashed border-border bg-transparent'
                : config.style === 'dotted'
                ? 'border-t border-dotted border-border bg-transparent'
                : ''
            }`}
            style={config.style === 'line' ? customStyle : {}}
          />
        )}
      </div>
    </div>
  );
}

// =====================================================
// Editor Component
// =====================================================

function DividerV1Editor({
  config,
  onChange,
}: {
  config: DividerV1Config;
  onChange: (config: DividerV1Config) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Stil</label>
        <select
          value={config.style}
          onChange={(e) =>
            onChange({
              ...config,
              style: e.target.value as
                | 'line'
                | 'dashed'
                | 'dotted'
                | 'gradient'
                | 'icon',
            })
          }
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="line">Düz Çizgi</option>
          <option value="dashed">Kesikli</option>
          <option value="dotted">Noktalı</option>
          <option value="gradient">Gradyan</option>
          <option value="icon">İkonlu</option>
        </select>
      </div>

      {config.style === 'icon' && (
        <div>
          <label className="mb-1 block text-sm font-medium">İkon</label>
          <input
            type="text"
            value={config.icon || ''}
            onChange={(e) => onChange({ ...config, icon: e.target.value })}
            placeholder="✦, ❀, ★, vb."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Kalınlık</label>
          <select
            value={config.thickness}
            onChange={(e) =>
              onChange({
                ...config,
                thickness: e.target.value as 'thin' | 'medium' | 'thick',
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="thin">İnce</option>
            <option value="medium">Orta</option>
            <option value="thick">Kalın</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Genişlik</label>
          <select
            value={config.width}
            onChange={(e) =>
              onChange({
                ...config,
                width: e.target.value as 'full' | '3/4' | '1/2' | '1/4',
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="full">Tam</option>
            <option value="3/4">3/4</option>
            <option value="1/2">Yarım</option>
            <option value="1/4">1/4</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Renk</label>
          <select
            value={config.color}
            onChange={(e) =>
              onChange({
                ...config,
                color: e.target.value as 'muted' | 'primary' | 'custom',
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="muted">Gri</option>
            <option value="primary">Birincil</option>
            <option value="custom">Özel</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Boşluk</label>
          <select
            value={config.spacing}
            onChange={(e) =>
              onChange({
                ...config,
                spacing: e.target.value as 'sm' | 'md' | 'lg' | 'xl',
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="sm">Küçük</option>
            <option value="md">Orta</option>
            <option value="lg">Büyük</option>
            <option value="xl">Çok Büyük</option>
          </select>
        </div>
      </div>

      {config.color === 'custom' && (
        <div>
          <label className="mb-1 block text-sm font-medium">Özel Renk</label>
          <input
            type="color"
            value={config.customColor || '#000000'}
            onChange={(e) => onChange({ ...config, customColor: e.target.value })}
            className="h-10 w-full rounded-md border border-input"
          />
        </div>
      )}

      {/* Background */}
      <DividerBackgroundPicker
        value={config.background as import('../../shared/background-picker').BackgroundConfig}
        onChange={(bg: import('../../shared/background-picker').BackgroundConfig) => onChange({ ...config, background: bg })}
      />
    </div>
  );
}

/** Background picker wrapper */
function DividerBackgroundPicker(props: { value: import('../../shared/background-picker').BackgroundConfig; onChange: (bg: import('../../shared/background-picker').BackgroundConfig) => void }) {
  const { BackgroundPicker } = require('../../shared/background-picker') as typeof import('../../shared/background-picker');
  return <BackgroundPicker value={props.value} onChange={props.onChange} imageFolder="divider" />;
}

// =====================================================
// Module Definition
// =====================================================

export const dividerV1Module: ModuleDefinition<DividerV1Config> = {
  meta: dividerV1Meta,
  configSchema: dividerV1ConfigSchema,
  defaultConfig: dividerV1DefaultConfig,
  Render: DividerV1Render,
  Editor: DividerV1Editor,
};
