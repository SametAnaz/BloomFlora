/**
 * FAQ Module v1
 * Frequently Asked Questions accordion
 */

import { z } from 'zod';

import type { ModuleDefinition } from '../../types';

// =====================================================
// Config Schema
// =====================================================

const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const faqV1ConfigSchema = z.object({
  /** Section title */
  title: z.string().optional(),
  /** Section subtitle */
  subtitle: z.string().optional(),
  /** FAQ items */
  items: z.array(faqItemSchema).default([]),
  /** Layout style */
  layout: z.enum(['accordion', 'grid', 'list']).default('accordion'),
  /** Allow multiple open */
  allowMultiple: z.boolean().default(false),
  /** Columns for grid layout */
  columns: z.enum(['1', '2']).default('1'),
});

export type FaqV1Config = z.infer<typeof faqV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const faqV1DefaultConfig: FaqV1Config = {
  title: 'Sıkça Sorulan Sorular',
  subtitle: 'Merak ettiklerinize cevap bulun',
  items: [
    {
      question: 'Siparişim ne zaman teslim edilir?',
      answer:
        'Siparişleriniz, sipariş verdiğiniz gün içinde veya en geç ertesi gün teslim edilir. Acil teslimat seçeneği ile 2-4 saat içinde de teslimat mümkündür.',
    },
    {
      question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
      answer:
        'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerini kabul ediyoruz. Online ödemeleriniz SSL güvencesi altındadır.',
    },
    {
      question: 'Çiçeklerin tazeliği garantili mi?',
      answer:
        'Evet, tüm çiçeklerimiz günlük olarak temin edilir ve tazelik garantisi sunuyoruz. Memnun kalmazsanız değişim veya iade yapabilirsiniz.',
    },
    {
      question: 'Kurumsal sipariş verebilir miyim?',
      answer:
        'Elbette! Kurumsal müşterilerimize özel indirimler ve fatura kesimi imkanı sunuyoruz. Detaylı bilgi için bizimle iletişime geçin.',
    },
  ],
  layout: 'accordion',
  allowMultiple: false,
  columns: '1',
};

// =====================================================
// Module Metadata
// =====================================================

export const faqV1Meta = {
  id: 'faq.v1',
  name: 'SSS (Sıkça Sorulan Sorular)',
  description: 'Soru-cevap formatında accordion',
  category: 'content' as const,
  icon: 'HelpCircle',
  version: '1.0.0',
  tags: ['faq', 'questions', 'accordion', 'help'],
};

// =====================================================
// Render Component
// =====================================================

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: { question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left font-medium hover:text-primary"
      >
        <span>{item.question}</span>
        <span
          className={`ml-4 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="pb-4 text-muted-foreground">
          <p>{item.answer}</p>
        </div>
      )}
    </div>
  );
}

function FaqV1Render({
  block,
}: {
  block: { config: FaqV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;

  // Simple state for accordion - in real app would use React state
  // For SSR/preview, show all expanded
  const allOpen = true;

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="mx-auto max-w-4xl">
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

        {/* FAQ Items */}
        {config.layout === 'accordion' && (
          <div className="divide-y rounded-lg border">
            {config.items.map((item, index) => (
              <div key={index} className="px-4">
                <FaqAccordionItem
                  item={item}
                  isOpen={allOpen}
                  onToggle={() => {}}
                />
              </div>
            ))}
          </div>
        )}

        {config.layout === 'grid' && (
          <div
            className={`grid gap-6 ${
              config.columns === '2' ? 'md:grid-cols-2' : ''
            }`}
          >
            {config.items.map((item, index) => (
              <div key={index} className="rounded-lg border bg-card p-6">
                <h3 className="mb-2 font-semibold">{item.question}</h3>
                <p className="text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        )}

        {config.layout === 'list' && (
          <div className="space-y-6">
            {config.items.map((item, index) => (
              <div key={index}>
                <h3 className="mb-2 font-semibold">{item.question}</h3>
                <p className="text-muted-foreground">{item.answer}</p>
              </div>
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

function FaqV1Editor({
  config,
  onChange,
}: {
  config: FaqV1Config;
  onChange: (config: FaqV1Config) => void;
}) {
  const addItem = () => {
    onChange({
      ...config,
      items: [...config.items, { question: 'Yeni soru?', answer: 'Cevap...' }],
    });
  };

  const removeItem = (index: number) => {
    onChange({
      ...config,
      items: config.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (
    index: number,
    field: 'question' | 'answer',
    value: string
  ) => {
    const newItems = [...config.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...config, items: newItems });
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
                layout: e.target.value as 'accordion' | 'grid' | 'list',
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="accordion">Accordion</option>
            <option value="grid">Grid</option>
            <option value="list">Liste</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Sütun</label>
          <select
            value={config.columns}
            onChange={(e) =>
              onChange({ ...config, columns: e.target.value as '1' | '2' })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="1">1 Sütun</option>
            <option value="2">2 Sütun</option>
          </select>
        </div>
      </div>

      {/* FAQ Items */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Sorular</label>
          <button
            type="button"
            onClick={addItem}
            className="text-sm text-primary hover:underline"
          >
            + Ekle
          </button>
        </div>
        <div className="space-y-3">
          {config.items.map((item, index) => (
            <div key={index} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Soru {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-sm text-destructive hover:underline"
                >
                  Sil
                </button>
              </div>
              <input
                type="text"
                placeholder="Soru"
                value={item.question}
                onChange={(e) => updateItem(index, 'question', e.target.value)}
                className="mb-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Cevap"
                value={item.answer}
                onChange={(e) => updateItem(index, 'answer', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
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

export const faqV1Module: ModuleDefinition<FaqV1Config> = {
  meta: faqV1Meta,
  configSchema: faqV1ConfigSchema,
  defaultConfig: faqV1DefaultConfig,
  Render: FaqV1Render,
  Editor: FaqV1Editor,
};
