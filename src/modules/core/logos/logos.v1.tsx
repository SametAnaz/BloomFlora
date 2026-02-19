/**
 * Logo Grid Module v1
 * Partner/brand logos showcase
 */

import { z } from 'zod';

import { backgroundConfigSchema, type ModuleDefinition } from '../../types';

// =====================================================
// Config Schema
// =====================================================

const logoItemSchema = z.object({
  name: z.string().min(1),
  image: z.string().optional(),
  link: z.string().optional(),
});

export const logosV1ConfigSchema = z.object({
  /** Section title */
  title: z.string().optional(),
  /** Section subtitle */
  subtitle: z.string().optional(),
  /** Logo items */
  logos: z.array(logoItemSchema).default([]),
  /** Number of logos per row */
  columns: z.enum(['4', '5', '6']).default('5'),
  /** Layout style */
  style: z.enum(['simple', 'bordered', 'carousel']).default('simple'),
  /** Grayscale filter */
  grayscale: z.boolean().default(true),
  /** Background */
  background: backgroundConfigSchema.default({ type: 'none' }),
});

export type LogosV1Config = z.infer<typeof logosV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const logosV1DefaultConfig: LogosV1Config = {
  title: 'İş Ortaklarımız',
  subtitle: 'Güvenilir markalarla çalışıyoruz',
  logos: [
    { name: 'Partner 1' },
    { name: 'Partner 2' },
    { name: 'Partner 3' },
    { name: 'Partner 4' },
    { name: 'Partner 5' },
  ],
  columns: '5',
  style: 'simple',
  grayscale: true,
  background: { type: 'none' as const },
};

// =====================================================
// Module Metadata
// =====================================================

export const logosV1Meta = {
  id: 'logos.v1',
  name: 'Logo Galerisi',
  description: 'Partner ve marka logoları gösterimi',
  category: 'media' as const,
  icon: 'Building2',
  version: '1.0.0',
  tags: ['logos', 'partners', 'brands', 'clients'],
};

// =====================================================
// Render Component
// =====================================================

function LogosV1Render({
  block,
}: {
  block: { config: LogosV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;

  const gridCols: Record<string, string> = {
    '4': 'grid-cols-2 md:grid-cols-4',
    '5': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    '6': 'grid-cols-3 md:grid-cols-6',
  };

  const LogoItem = ({ logo }: { logo: typeof config.logos[number] }) => {
    const content = (
      <div
        className={`flex h-20 items-center justify-center rounded-lg px-4 transition-all ${
          config.style === 'bordered' ? 'border bg-card' : ''
        } ${config.grayscale ? 'grayscale hover:grayscale-0' : ''} hover:opacity-100`}
        style={{ opacity: config.grayscale ? 0.7 : 1 }}
      >
        {logo.image ? (
          <img
            src={logo.image}
            alt={logo.name}
            className="max-h-12 max-w-full object-contain"
          />
        ) : (
          <div className="text-lg font-semibold text-muted-foreground">
            {logo.name}
          </div>
        )}
      </div>
    );

    if (logo.link) {
      return (
        <a
          href={logo.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {content}
        </a>
      );
    }

    return content;
  };

  const { getBackgroundStyle, needsOverlay } = require('../../shared/background-picker') as typeof import('../../shared/background-picker');
  const bgStyle = getBackgroundStyle(config.background as import('../../shared/background-picker').BackgroundConfig);
  const showOverlay = needsOverlay(config.background as import('../../shared/background-picker').BackgroundConfig);

  return (
    <section className="relative py-12 px-4 md:px-8" style={bgStyle}>
      {showOverlay && (
        <div className="absolute inset-0 bg-black/50" style={{ opacity: ((config.background as Record<string, unknown>)?.overlayOpacity as number ?? 40) / 100 }} />
      )}
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        {(config.title || config.subtitle) && (
          <div className="mb-10 text-center">
            {config.title && (
              <h2 className="text-2xl font-bold md:text-3xl">{config.title}</h2>
            )}
            {config.subtitle && (
              <p className="mt-2 text-muted-foreground">{config.subtitle}</p>
            )}
          </div>
        )}

        {/* Logo Grid */}
        {config.style === 'carousel' ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-8">
              {config.logos.map((logo, index) => (
                <div key={index} className="flex-shrink-0">
                  <LogoItem logo={logo} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`grid gap-6 ${gridCols[config.columns]}`}>
            {config.logos.map((logo, index) => (
              <LogoItem key={index} logo={logo} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// =====================================================
// Editor Component
// =====================================================

function LogosV1Editor({
  config,
  onChange,
}: {
  config: LogosV1Config;
  onChange: (config: LogosV1Config) => void;
}) {
  const addLogo = () => {
    onChange({
      ...config,
      logos: [...config.logos, { name: 'Yeni Partner' }],
    });
  };

  const removeLogo = (index: number) => {
    onChange({
      ...config,
      logos: config.logos.filter((_, i) => i !== index),
    });
  };

  const updateLogo = (
    index: number,
    field: keyof typeof config.logos[number],
    value: string
  ) => {
    const newLogos = [...config.logos];
    newLogos[index] = { ...newLogos[index], [field]: value };
    onChange({ ...config, logos: newLogos });
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
          <label className="mb-1 block text-sm font-medium">Sütun</label>
          <select
            value={config.columns}
            onChange={(e) =>
              onChange({ ...config, columns: e.target.value as '4' | '5' | '6' })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="4">4 Sütun</option>
            <option value="5">5 Sütun</option>
            <option value="6">6 Sütun</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Stil</label>
          <select
            value={config.style}
            onChange={(e) =>
              onChange({
                ...config,
                style: e.target.value as 'simple' | 'bordered' | 'carousel',
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="simple">Basit</option>
            <option value="bordered">Kenarlıklı</option>
            <option value="carousel">Carousel</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.grayscale}
          onChange={(e) => onChange({ ...config, grayscale: e.target.checked })}
        />
        <span className="text-sm">Gri Tonlama (Hover&apos;da renkli)</span>
      </label>

      {/* Background */}
      <LogosBackgroundPicker
        value={config.background as import('../../shared/background-picker').BackgroundConfig}
        onChange={(bg: import('../../shared/background-picker').BackgroundConfig) => onChange({ ...config, background: bg })}
      />

      {/* Logos List */}
      <div className="border-t pt-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold">Logolar ({config.logos.length})</label>
          <button
            type="button"
            onClick={addLogo}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Logo Ekle
          </button>
        </div>
        <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
          {config.logos.map((logo, index) => (
            <div
              key={index}
              className="rounded-lg border p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{logo.name || `Logo ${index + 1}`}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => { const ni = index - 1; if (ni < 0) return; const l = [...config.logos]; [l[index], l[ni]] = [l[ni], l[index]]; onChange({ ...config, logos: l }); }} disabled={index === 0} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" title="Yukarı">↑</button>
                  <button type="button" onClick={() => { const ni = index + 1; if (ni >= config.logos.length) return; const l = [...config.logos]; [l[index], l[ni]] = [l[ni], l[index]]; onChange({ ...config, logos: l }); }} disabled={index === config.logos.length - 1} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" title="Aşağı">↓</button>
                  <button
                    type="button"
                    onClick={() => removeLogo(index)}
                    className="rounded p-1 text-destructive hover:bg-destructive/10"
                    aria-label="Logoyu sil"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Logo adı"
                  value={logo.name}
                  onChange={(e) => updateLogo(index, 'name', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                />

                {/* Logo Image Upload */}
                <LogoImageUpload
                  value={logo.image || ''}
                  onChange={(url) => updateLogo(index, 'image', url)}
                />

                <input
                  type="text"
                  placeholder="Link (opsiyonel)"
                  value={logo.link || ''}
                  onChange={(e) => updateLogo(index, 'link', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
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
function LogosBackgroundPicker(props: { value: import('../../shared/background-picker').BackgroundConfig; onChange: (bg: import('../../shared/background-picker').BackgroundConfig) => void }) {
  const { BackgroundPicker } = require('../../shared/background-picker') as typeof import('../../shared/background-picker');
  return <BackgroundPicker value={props.value} onChange={props.onChange} imageFolder="logos" />;
}

/** Logo image upload wrapper using shared ImageUploadField */
function LogoImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const { ImageUploadField } = require('../../shared/image-upload-field') as { ImageUploadField: typeof import('../../shared/image-upload-field').ImageUploadField };
  return (
    <ImageUploadField
      value={value || undefined}
      onChange={onChange}
      folder="logos"
      compact={true}
      showUrlInput={true}
      previewClass="h-12 max-w-full object-contain"
    />
  );
}

// =====================================================
// Module Definition
// =====================================================

export const logosV1Module: ModuleDefinition<LogosV1Config> = {
  meta: logosV1Meta,
  configSchema: logosV1ConfigSchema,
  defaultConfig: logosV1DefaultConfig,
  Render: LogosV1Render,
  Editor: LogosV1Editor,
};
