/**
 * Testimonials Module v1
 * Customer reviews and testimonials carousel/grid
 */

import { z } from 'zod';

import type { ModuleDefinition } from '../../types';

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

  return (
    <section className="bg-muted/30 py-16 px-4 md:px-8">
      <div className="mx-auto max-w-6xl">
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
          <label className="mb-1 block text-sm font-medium">Görünüm</label>
          <select
            value={config.layout}
            onChange={(e) =>
              onChange({
                ...config,
                layout: e.target.value as 'grid' | 'carousel' | 'single',
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
          />
          <span className="text-sm">Yıldızları Göster</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.showAvatar}
            onChange={(e) => onChange({ ...config, showAvatar: e.target.checked })}
          />
          <span className="text-sm">Avatarları Göster</span>
        </label>
      </div>

      {/* Testimonials List */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Yorumlar</label>
          <button
            type="button"
            onClick={addTestimonial}
            className="text-sm text-primary hover:underline"
          >
            + Ekle
          </button>
        </div>
        <div className="space-y-3">
          {config.testimonials.map((testimonial, index) => (
            <div key={index} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Yorum {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeTestimonial(index)}
                  className="text-sm text-destructive hover:underline"
                >
                  Sil
                </button>
              </div>
              <input
                type="text"
                placeholder="İsim"
                value={testimonial.name}
                onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                className="mb-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Unvan"
                value={testimonial.role || ''}
                onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                className="mb-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Yorum içeriği"
                value={testimonial.content}
                onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                className="mb-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
              />
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Puan: {testimonial.rating || 5}
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
