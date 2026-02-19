/**
 * Image Gallery Module v1
 * Responsive image gallery with lightbox support
 */

import { z } from 'zod';

import {
  backgroundConfigSchema,
  imageRefSchema,
  spacingConfigSchema,
  type ImageRef,
  type ModuleDefinition,
} from '../../types';

// =====================================================
// Config Schema
// =====================================================

export const imageGalleryV1ConfigSchema = z.object({
  /** Gallery title */
  title: z.string().optional(),
  /** Gallery images */
  images: z.array(imageRefSchema).min(1),
  /** Grid columns on desktop */
  columns: z.enum(['2', '3', '4', '5']).default('3'),
  /** Image aspect ratio */
  aspectRatio: z.enum(['square', '4:3', '16:9', 'auto']).default('square'),
  /** Gap between images */
  gap: z.enum(['sm', 'md', 'lg']).default('md'),
  /** Enable lightbox on click */
  lightbox: z.boolean().default(true),
  /** Spacing */
  spacing: spacingConfigSchema.default({}),
  /** Background */
  background: backgroundConfigSchema.default({ type: 'none' }),
});

export type ImageGalleryV1Config = z.infer<typeof imageGalleryV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const imageGalleryV1DefaultConfig: ImageGalleryV1Config = {
  title: 'Galeri',
  images: [
    { src: '/placeholder-1.jpg', alt: 'Görsel 1' },
    { src: '/placeholder-2.jpg', alt: 'Görsel 2' },
    { src: '/placeholder-3.jpg', alt: 'Görsel 3' },
    { src: '/placeholder-4.jpg', alt: 'Görsel 4' },
    { src: '/placeholder-5.jpg', alt: 'Görsel 5' },
    { src: '/placeholder-6.jpg', alt: 'Görsel 6' },
  ],
  columns: '3',
  aspectRatio: 'square',
  gap: 'md',
  lightbox: true,
  spacing: {
    paddingTop: 'lg',
    paddingBottom: 'lg',
  },
  background: { type: 'none' },
};

// =====================================================
// Module Metadata
// =====================================================

export const imageGalleryV1Meta = {
  id: 'imageGallery.v1',
  name: 'Görsel Galeri',
  description: 'Duyarlı görsel galerisi - ızgara düzeni ve lightbox desteği',
  category: 'media' as const,
  icon: 'Images',
  version: '1.0.0',
  tags: ['gallery', 'images', 'photos', 'grid'],
};

// =====================================================
// Components
// =====================================================

const columnClasses: Record<string, string> = {
  '2': 'grid-cols-2',
  '3': 'grid-cols-2 md:grid-cols-3',
  '4': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  '5': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
};

const gapClasses: Record<string, string> = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

const aspectClasses: Record<string, string> = {
  square: 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  auto: '',
};

function ImageGalleryV1Render({
  block,
}: {
  block: { config: ImageGalleryV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;

  const bgStyle = (() => {
    const { getBackgroundStyle } = require('../../shared/background-picker') as { getBackgroundStyle: typeof import('../../shared/background-picker').getBackgroundStyle };
    return getBackgroundStyle(config.background as import('../../shared/background-picker').BackgroundConfig);
  })();
  const bgOverlay = typeof config.background === 'object' && (config.background as import('../../shared/background-picker').BackgroundConfig).overlayOpacity;

  return (
    <section className="relative py-12 md:py-16" style={bgStyle}>
      {bgOverlay ? <div className="absolute inset-0 bg-black" style={{ opacity: ((config.background as import('../../shared/background-picker').BackgroundConfig).overlayOpacity ?? 0) / 100 }} /> : null}
      <div className="relative z-10 container-mobile">
        {config.title ? <h2 className="mb-8 text-2xl font-bold md:text-3xl">{config.title}</h2> : null}

        <div
          className={`grid ${columnClasses[config.columns]} ${gapClasses[config.gap]}`}
        >
          {config.images.map((image, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-lg bg-muted ${aspectClasses[config.aspectRatio]}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt}
                className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                  config.lightbox ? 'cursor-pointer' : ''
                }`}
                loading="lazy"
              />
              {/* Overlay on hover */}
              {config.lightbox ? <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                  <svg
                    className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImageGalleryV1Editor({
  config,
  onChange,
}: {
  config: ImageGalleryV1Config;
  onChange: (config: ImageGalleryV1Config) => void;
  blockId: string;
}) {
  const addImage = () => {
    onChange({
      ...config,
      images: [...config.images, { src: '/placeholder.jpg', alt: 'Yeni görsel' }],
    });
  };

  const removeImage = (index: number) => {
    onChange({
      ...config,
      images: config.images.filter((_, i) => i !== index),
    });
  };

  const updateImage = (index: number, updates: Partial<ImageRef>) => {
    const newImages = [...config.images];
    newImages[index] = { ...newImages[index], ...updates };
    onChange({ ...config, images: newImages });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.images.length) return;
    const newImages = [...config.images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    onChange({ ...config, images: newImages });
  };

  const inputCls = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Başlık</label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className={inputCls}
          placeholder="Galeri başlığı (opsiyonel)"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Sütun</label>
          <select
            value={config.columns}
            onChange={(e) => onChange({ ...config, columns: e.target.value as ImageGalleryV1Config['columns'] })}
            className={inputCls}
          >
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Oran</label>
          <select
            value={config.aspectRatio}
            onChange={(e) => onChange({ ...config, aspectRatio: e.target.value as ImageGalleryV1Config['aspectRatio'] })}
            className={inputCls}
          >
            <option value="square">Kare</option>
            <option value="4:3">4:3</option>
            <option value="16:9">16:9</option>
            <option value="auto">Oto</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Boşluk</label>
          <select
            value={config.gap}
            onChange={(e) => onChange({ ...config, gap: e.target.value as ImageGalleryV1Config['gap'] })}
            className={inputCls}
          >
            <option value="sm">Küçük</option>
            <option value="md">Orta</option>
            <option value="lg">Büyük</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.lightbox}
          onChange={(e) => onChange({ ...config, lightbox: e.target.checked })}
          className="rounded"
        />
        <span className="text-sm">Lightbox aktif</span>
      </label>

      {/* Background */}
      <GalleryBackgroundPicker
        value={(config.background || { type: 'none' }) as import('../../shared/background-picker').BackgroundConfig}
        onChange={(bg) => onChange({ ...config, background: bg as ImageGalleryV1Config['background'] })}
      />

      {/* Images */}
      <div className="border-t pt-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold">Görseller ({config.images.length})</label>
          <button
            onClick={addImage}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            type="button"
          >
            + Görsel Ekle
          </button>
        </div>
        <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
          {config.images.map((image, index) => (
            <div key={index} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Görsel {index + 1}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveImage(index, 'up')} disabled={index === 0} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" title="Yukarı">↑</button>
                  <button type="button" onClick={() => moveImage(index, 'down')} disabled={index === config.images.length - 1} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" title="Aşağı">↓</button>
                  <button
                    onClick={() => removeImage(index)}
                    className="rounded p-1 text-destructive hover:bg-destructive/10"
                    type="button"
                    aria-label="Görseli sil"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Image Upload Field */}
              <GalleryImageUpload
                value={image.src}
                onChange={(url) => updateImage(index, { src: url })}
              />

              <input
                type="text"
                value={image.alt}
                onChange={(e) => updateImage(index, { alt: e.target.value })}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                placeholder="Alt metin"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Inline image upload for gallery items
 * Uses dynamic import to avoid 'use client' on the module file
 */
function GalleryImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const { ImageUploadField } = require('../../shared/image-upload-field') as { ImageUploadField: typeof import('../../shared/image-upload-field').ImageUploadField };
  return (
    <ImageUploadField
      value={value !== '/placeholder.jpg' && value !== '/placeholder-1.jpg' && value !== '/placeholder-2.jpg' && value !== '/placeholder-3.jpg' && value !== '/placeholder-4.jpg' && value !== '/placeholder-5.jpg' && value !== '/placeholder-6.jpg' ? value : undefined}
      onChange={onChange}
      folder="gallery"
      showUrlInput={true}
      compact={true}
      previewClass="h-24 w-full object-cover"
    />
  );
}

function GalleryBackgroundPicker({ value, onChange }: { value: import('../../shared/background-picker').BackgroundConfig; onChange: (bg: import('../../shared/background-picker').BackgroundConfig) => void }) {
  const { BackgroundPicker } = require('../../shared/background-picker') as { BackgroundPicker: typeof import('../../shared/background-picker').BackgroundPicker };
  return <BackgroundPicker value={value} onChange={onChange} imageFolder="gallery" />;
}

// =====================================================
// Module Definition
// =====================================================

export const imageGalleryV1Module: ModuleDefinition<ImageGalleryV1Config> = {
  meta: imageGalleryV1Meta,
  configSchema: imageGalleryV1ConfigSchema,
  defaultConfig: imageGalleryV1DefaultConfig,
  Render: ImageGalleryV1Render,
  Editor: ImageGalleryV1Editor,
};
