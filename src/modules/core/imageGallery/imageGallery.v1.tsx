/**
 * Image Gallery Module v1
 * Responsive image gallery with lightbox support
 */

import { z } from 'zod';

import {
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

  return (
    <section className="py-12 md:py-16">
      <div className="container-mobile">
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

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Başlık</label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Galeri başlığı (opsiyonel)"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Sütun</label>
          <select
            value={config.columns}
            onChange={(e) =>
              onChange({
                ...config,
                columns: e.target.value as ImageGalleryV1Config['columns'],
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            onChange={(e) =>
              onChange({
                ...config,
                aspectRatio: e.target.value as ImageGalleryV1Config['aspectRatio'],
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            onChange={(e) =>
              onChange({
                ...config,
                gap: e.target.value as ImageGalleryV1Config['gap'],
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="sm">Küçük</option>
            <option value="md">Orta</option>
            <option value="lg">Büyük</option>
          </select>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Görseller</label>
          <button
            onClick={addImage}
            className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground"
            type="button"
          >
            + Ekle
          </button>
        </div>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {config.images.map((image, index) => (
            <div key={index} className="rounded-md border p-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Görsel {index + 1}</span>
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
              <input
                type="text"
                value={image.src}
                onChange={(e) => updateImage(index, { src: e.target.value })}
                className="mb-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                placeholder="Görsel URL"
              />
              <input
                type="text"
                value={image.alt}
                onChange={(e) => updateImage(index, { alt: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                placeholder="Alt metin"
              />
            </div>
          ))}
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
    </div>
  );
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
