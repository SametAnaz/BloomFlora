/**
 * Testimonials Module v1
 * Customer reviews and testimonials carousel/grid
 */

import { z } from 'zod';

import { backgroundConfigSchema, type ModuleDefinition } from '../../types';

// =====================================================
// Config Schema
// =====================================================

const testimonialItemSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  company: z.string().optional(),
  avatar: z.string().optional(),
  content: z.string().min(1),
  rating: z.number().min(1).max(5).optional(),
});

export const testimonialsV1ConfigSchema = z.object({
  /** Section title */
  title: z.string().optional(),
  /** Section subtitle */
  subtitle: z.string().optional(),
  /** Testimonial items */
  testimonials: z.array(testimonialItemSchema).default([]),
  /** Layout style */
  layout: z.enum(['grid', 'carousel', 'single']).default('grid'),
  /** Show rating stars */
  showRating: z.boolean().default(true),
  /** Show avatars */
  showAvatar: z.boolean().default(true),
  /** Grid columns (for grid layout) */
  columns: z.enum(['2', '3']).default('3'),
  /** Background */
  background: backgroundConfigSchema.default({ type: 'none' }),
});

export type TestimonialsV1Config = z.infer<typeof testimonialsV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const testimonialsV1DefaultConfig: TestimonialsV1Config = {
  title: 'Müşteri Yorumları',
  subtitle: 'Müşterilerimizin bizim hakkımızda düşünceleri',
  testimonials: [
    {
      name: 'Ayşe Yılmaz',
      role: 'Moda Blogger',
      content:
        'Harika bir deneyimdi! Çiçekler çok taze ve güzeldi. Kesinlikle tekrar sipariş vereceğim.',
      rating: 5,
    },
    {
      name: 'Mehmet Kaya',
      role: 'İş İnsanı',
      content:
        'Kurumsal etkinliğimiz için sipariş verdik. Profesyonel hizmet ve kaliteli ürünler.',
      rating: 5,
    },
    {
      name: 'Zeynep Demir',
      role: 'Ev Hanımı',
      content:
        'Her hafta evime taze çiçekler alıyorum. Fiyatlar çok uygun ve teslimat her zaman zamanında.',
      rating: 4,
    },
  ],
  layout: 'grid',
  showRating: true,
  showAvatar: true,
  columns: '3',
  background: { type: 'none' },
};

// =====================================================
// Module Metadata
// =====================================================

export const testimonialsV1Meta = {
  id: 'testimonials.v1',
  name: 'Müşteri Yorumları',
  description: 'Müşteri yorumları ve değerlendirmeleri',
  category: 'social' as const,
  icon: 'MessageSquareQuote',
  version: '1.0.0',
  tags: ['testimonials', 'reviews', 'social', 'feedback'],
};

// =====================================================
// Render Component
// =====================================================

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  showRating,
  showAvatar,
}: {
  testimonial: TestimonialsV1Config['testimonials'][number];
  showRating: boolean;
  showAvatar: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      {/* Rating */}
      {showRating && testimonial.rating && (
        <div className="mb-4">
          <StarRating rating={testimonial.rating} />
        </div>
      )}

      {/* Content */}
      <blockquote className="mb-4 text-muted-foreground">
        "{testimonial.content}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        {showAvatar && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            {testimonial.avatar ? (
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold">
                {testimonial.name.charAt(0)}
              </span>
            )}
          </div>
        )}
        <div>
          <div className="font-semibold">{testimonial.name}</div>
          {(testimonial.role || testimonial.company) && (
            <div className="text-sm text-muted-foreground">
              {testimonial.role}
              {testimonial.role && testimonial.company && ' - '}
              {testimonial.company}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TestimonialsV1Render({
  block,
}: {
  block: { config: TestimonialsV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;

  const gridCols: Record<string, string> = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-3',
  };

  const bgStyle = (() => {
    const { getBackgroundStyle } = require('../../shared/background-picker') as { getBackgroundStyle: typeof import('../../shared/background-picker').getBackgroundStyle };
    return getBackgroundStyle(config.background as import('../../shared/background-picker').BackgroundConfig);
  })();
  const bgOverlay = typeof config.background === 'object' && (config.background as import('../../shared/background-picker').BackgroundConfig).overlayOpacity;

  return (
    <section className="relative py-16 px-4 md:px-8" style={bgStyle}>
      {bgOverlay ? <div className="absolute inset-0 bg-black" style={{ opacity: ((config.background as import('../../shared/background-picker').BackgroundConfig).overlayOpacity ?? 0) / 100 }} /> : null}
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        {(config.title || config.subtitle) && (
          <div className="mb-12 text-center">
            {config.title && (
              <h2 className="text-3xl font-bold md:text-4xl">{config.title}</h2>
            )}
            {config.subtitle && (
              <p className="mt-3 text-lg text-muted-foreground">{config.subtitle}</p>
            )}
          </div>
        )}

        {/* Testimonials */}
        {config.layout === 'single' && config.testimonials[0] && (
          <div className="mx-auto max-w-2xl">
            <TestimonialCard
              testimonial={config.testimonials[0]}
              showRating={config.showRating}
              showAvatar={config.showAvatar}
            />
          </div>
        )}

        {config.layout === 'grid' && (
          <div className={`grid gap-6 ${gridCols[config.columns]}`}>
            {config.testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                testimonial={testimonial}
                showRating={config.showRating}
                showAvatar={config.showAvatar}
              />
            ))}
          </div>
        )}

        {config.layout === 'carousel' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6">
              {config.testimonials.map((testimonial, index) => (
                <div key={index} className="w-80 flex-shrink-0">
                  <TestimonialCard
                    testimonial={testimonial}
                    showRating={config.showRating}
                    showAvatar={config.showAvatar}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// =====================================================
// Editor Component
// =====================================================

function TestimonialsV1Editor({
  config,
  onChange,
}: {
  config: TestimonialsV1Config;
  onChange: (config: TestimonialsV1Config) => void;
}) {
  const addTestimonial = () => {
    onChange({
      ...config,
      testimonials: [
        ...config.testimonials,
        { name: 'Yeni Müşteri', content: 'Yorum ekleyin...', rating: 5 },
      ],
    });
  };

  const removeTestimonial = (index: number) => {
    onChange({
      ...config,
      testimonials: config.testimonials.filter((_, i) => i !== index),
    });
  };

  const updateTestimonial = (
    index: number,
    field: keyof typeof config.testimonials[number],
    value: string | number
  ) => {
    const newTestimonials = [...config.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    onChange({ ...config, testimonials: newTestimonials });
  };

  const moveTestimonial = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.testimonials.length) return;
    const newTestimonials = [...config.testimonials];
    [newTestimonials[index], newTestimonials[newIndex]] = [newTestimonials[newIndex], newTestimonials[index]];
    onChange({ ...config, testimonials: newTestimonials });
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
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Alt Başlık</label>
        <input
          type="text"
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Görünüm</label>
          <select
            value={config.layout}
            onChange={(e) =>
              onChange({
                ...config,
                layout: e.target.value as 'grid' | 'carousel' | 'single',
              })
            }
            className={inputCls}
          >
            <option value="grid">Grid</option>
            <option value="carousel">Carousel</option>
            <option value="single">Tekli</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Sütun</label>
          <select
            value={config.columns}
            onChange={(e) =>
              onChange({ ...config, columns: e.target.value as '2' | '3' })
            }
            className={inputCls}
          >
            <option value="2">2 Sütun</option>
            <option value="3">3 Sütun</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.showRating}
            onChange={(e) => onChange({ ...config, showRating: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Yıldızları Göster</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.showAvatar}
            onChange={(e) => onChange({ ...config, showAvatar: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Avatarları Göster</span>
        </label>
      </div>

      {/* Background */}
      <TestimonialsBackgroundPicker
        value={(config.background || { type: 'none' }) as import('../../shared/background-picker').BackgroundConfig}
        onChange={(bg) => onChange({ ...config, background: bg as TestimonialsV1Config['background'] })}
      />

      {/* Testimonials List */}
      <div className="border-t pt-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold">Yorumlar ({config.testimonials.length})</label>
          <button
            type="button"
            onClick={addTestimonial}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Yorum Ekle
          </button>
        </div>
        <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
          {config.testimonials.map((testimonial, index) => (
            <div key={index} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Yorum {index + 1}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveTestimonial(index, 'up')} disabled={index === 0} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" title="Yukarı">↑</button>
                  <button type="button" onClick={() => moveTestimonial(index, 'down')} disabled={index === config.testimonials.length - 1} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" title="Aşağı">↓</button>
                  <button
                    type="button"
                    onClick={() => removeTestimonial(index)}
                    className="rounded p-1 text-destructive hover:bg-destructive/10"
                    aria-label="Yorumu sil"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="İsim"
                value={testimonial.name}
                onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                className="mb-2 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              />
              <div className="mb-2 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Unvan"
                  value={testimonial.role || ''}
                  onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                />
                <input
                  type="text"
                  placeholder="Şirket"
                  value={testimonial.company || ''}
                  onChange={(e) => updateTestimonial(index, 'company', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                />
              </div>

              {/* Avatar Upload */}
              <div className="mb-2">
                <label className="mb-1 block text-xs text-muted-foreground">Avatar</label>
                <TestimonialAvatarUpload
                  value={testimonial.avatar || ''}
                  onChange={(url) => updateTestimonial(index, 'avatar', url)}
                />
              </div>

              <textarea
                placeholder="Yorum içeriği"
                value={testimonial.content}
                onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                className="mb-2 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                rows={3}
              />
              <div>
                <label className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  Puan:
                  <span className="font-semibold text-yellow-500">
                    {'★'.repeat(testimonial.rating || 5)}{'☆'.repeat(5 - (testimonial.rating || 5))}
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={testimonial.rating || 5}
                  onChange={(e) =>
                    updateTestimonial(index, 'rating', parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Avatar upload wrapper using shared ImageUploadField */
function TestimonialAvatarUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const { ImageUploadField } = require('../../shared/image-upload-field') as { ImageUploadField: typeof import('../../shared/image-upload-field').ImageUploadField };
  return (
    <ImageUploadField
      value={value || undefined}
      onChange={onChange}
      folder="testimonials"
      compact={true}
      showUrlInput={true}
      previewClass="h-12 w-12 rounded-full object-cover"
    />
  );
}

/** Background picker wrapper */
function TestimonialsBackgroundPicker({ value, onChange }: { value: import('../../shared/background-picker').BackgroundConfig; onChange: (bg: import('../../shared/background-picker').BackgroundConfig) => void }) {
  const { BackgroundPicker } = require('../../shared/background-picker') as { BackgroundPicker: typeof import('../../shared/background-picker').BackgroundPicker };
  return <BackgroundPicker value={value} onChange={onChange} imageFolder="testimonials" />;
}

// =====================================================
// Module Definition
// =====================================================

export const testimonialsV1Module: ModuleDefinition<TestimonialsV1Config> = {
  meta: testimonialsV1Meta,
  configSchema: testimonialsV1ConfigSchema,
  defaultConfig: testimonialsV1DefaultConfig,
  Render: TestimonialsV1Render,
  Editor: TestimonialsV1Editor,
};
