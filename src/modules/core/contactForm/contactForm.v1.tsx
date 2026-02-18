/**
 * Contact Form Module v1
 * Simple contact form with name, email, phone, message
 */

import * as React from 'react';

import { z } from 'zod';

import { spacingConfigSchema, type ModuleDefinition } from '../../types';

// =====================================================
// Config Schema
// =====================================================

export const contactFormV1ConfigSchema = z.object({
  /** Form title */
  title: z.string().default('İletişim'),
  /** Subtitle/description */
  subtitle: z.string().optional(),
  /** Show name field */
  showName: z.boolean().default(true),
  /** Show phone field */
  showPhone: z.boolean().default(true),
  /** Show subject field */
  showSubject: z.boolean().default(false),
  /** Submit button text */
  submitText: z.string().default('Gönder'),
  /** Success message */
  successMessage: z.string().default('Mesajınız başarıyla gönderildi!'),
  /** Form layout */
  layout: z.enum(['stacked', 'inline']).default('stacked'),
  /** Email recipient (admin only) */
  recipientEmail: z.string().email().optional(),
  /** Spacing */
  spacing: spacingConfigSchema.default({}),
});

export type ContactFormV1Config = z.infer<typeof contactFormV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const contactFormV1DefaultConfig: ContactFormV1Config = {
  title: 'Bize Ulaşın',
  subtitle: 'Sorularınız için bizimle iletişime geçebilirsiniz.',
  showName: true,
  showPhone: true,
  showSubject: false,
  submitText: 'Mesaj Gönder',
  successMessage: 'Mesajınız başarıyla gönderildi! En kısa sürede dönüş yapacağız.',
  layout: 'stacked',
  spacing: {
    paddingTop: 'lg',
    paddingBottom: 'lg',
  },
};

// =====================================================
// Module Metadata
// =====================================================

export const contactFormV1Meta = {
  id: 'contactForm.v1',
  name: 'İletişim Formu',
  description: 'Basit iletişim formu - ad, email, telefon, mesaj alanları',
  category: 'contact' as const,
  icon: 'Mail',
  version: '1.0.0',
  tags: ['contact', 'form', 'email', 'message'],
};

// =====================================================
// Components
// =====================================================

function ContactFormV1Render({
  block,
  isPreview,
}: {
  block: { config: ContactFormV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'preview'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      setSubmitStatus('preview');
      return;
    }
    // TODO: Implement form submission
    setSubmitStatus('success');
  };

  return (
    <section className="py-12 md:py-16" id="contact">
      <div className="container-mobile">
        <div className="mx-auto max-w-2xl">
          {/* Status Messages */}
          {submitStatus === 'success' ? (
            <div className="mb-6 rounded-md bg-green-50 p-4 text-center text-green-800">
              {config.successMessage}
            </div>
          ) : null}
          {submitStatus === 'preview' ? (
            <div className="mb-6 rounded-md bg-yellow-50 p-4 text-center text-yellow-800">
              Önizleme modunda form gönderilemez.
            </div>
          ) : null}

          {/* Header */}
          {(config.title || config.subtitle) ? <div className="mb-8 text-center">
              {config.title ? <h2 className="text-2xl font-bold md:text-3xl">{config.title}</h2> : null}
              {config.subtitle ? <p className="mt-2 text-muted-foreground">{config.subtitle}</p> : null}
            </div> : null}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            {config.showName ? <div>
                <label htmlFor="contact-name" className="mb-1 block text-sm font-medium">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  required
                  className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Adınız Soyadınız"
                />
              </div> : null}

            {/* Email & Phone Row */}
            <div
              className={
                config.layout === 'inline' && config.showPhone
                  ? 'grid gap-4 md:grid-cols-2'
                  : 'space-y-4'
              }
            >
              {/* Email */}
              <div>
                <label htmlFor="contact-email" className="mb-1 block text-sm font-medium">
                  E-posta
                </label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  required
                  className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="ornek@email.com"
                />
              </div>

              {/* Phone */}
              {config.showPhone ? <div>
                  <label htmlFor="contact-phone" className="mb-1 block text-sm font-medium">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="contact-phone"
                    name="phone"
                    className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="05XX XXX XX XX"
                  />
                </div> : null}
            </div>

            {/* Subject */}
            {config.showSubject ? <div>
                <label htmlFor="contact-subject" className="mb-1 block text-sm font-medium">
                  Konu
                </label>
                <input
                  type="text"
                  id="contact-subject"
                  name="subject"
                  className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Mesajınızın konusu"
                />
              </div> : null}

            {/* Message */}
            <div>
              <label htmlFor="contact-message" className="mb-1 block text-sm font-medium">
                Mesaj
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                className="w-full resize-none rounded-md border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Mesajınızı buraya yazın..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {config.submitText}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function ContactFormV1Editor({
  config,
  onChange,
}: {
  config: ContactFormV1Config;
  onChange: (config: ContactFormV1Config) => void;
  blockId: string;
}) {
  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Başlık</label>
        <input
          type="text"
          value={config.title}
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
          placeholder="Opsiyonel"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Gönder Metni</label>
          <input
            type="text"
            value={config.submitText}
            onChange={(e) => onChange({ ...config, submitText: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Form Düzeni</label>
          <select
            value={config.layout}
            onChange={(e) =>
              onChange({
                ...config,
                layout: e.target.value as ContactFormV1Config['layout'],
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="stacked">Üst Üste</option>
            <option value="inline">Yan Yana</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Başarı Mesajı</label>
        <input
          type="text"
          value={config.successMessage}
          onChange={(e) => onChange({ ...config, successMessage: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Alıcı E-posta</label>
        <input
          type="email"
          value={config.recipientEmail || ''}
          onChange={(e) => onChange({ ...config, recipientEmail: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="info@bloomflora.com"
        />
        <p className="mt-1 text-xs text-muted-foreground">Form gönderimlerinin iletileceği e-posta</p>
      </div>

      <div className="space-y-2 border-t pt-4">
        <label className="block text-sm font-medium">Görünür Alanlar</label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.showName}
            onChange={(e) => onChange({ ...config, showName: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Ad Soyad</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.showPhone}
            onChange={(e) => onChange({ ...config, showPhone: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Telefon</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.showSubject}
            onChange={(e) => onChange({ ...config, showSubject: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Konu</span>
        </label>
      </div>
    </div>
  );
}

// =====================================================
// Module Definition
// =====================================================

export const contactFormV1Module: ModuleDefinition<ContactFormV1Config> = {
  meta: contactFormV1Meta,
  configSchema: contactFormV1ConfigSchema,
  defaultConfig: contactFormV1DefaultConfig,
  Render: ContactFormV1Render,
  Editor: ContactFormV1Editor,
};
