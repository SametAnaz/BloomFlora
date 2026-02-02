/**
 * Rich Text Module v1
 * WYSIWYG content block with formatting options
 */

import { z } from 'zod';

import { spacingConfigSchema, type ModuleDefinition } from '../../types';

// =====================================================
// Config Schema
// =====================================================

export const richTextV1ConfigSchema = z.object({
  /** HTML content */
  content: z.string(),
  /** Container width */
  maxWidth: z.enum(['sm', 'md', 'lg', 'xl', 'full']).default('lg'),
  /** Text alignment */
  alignment: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  /** Spacing */
  spacing: spacingConfigSchema.default({}),
  /** Typography size */
  textSize: z.enum(['sm', 'base', 'lg']).default('base'),
});

export type RichTextV1Config = z.infer<typeof richTextV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const richTextV1DefaultConfig: RichTextV1Config = {
  content: `
    <h2>Hakkımızda</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  `.trim(),
  maxWidth: 'lg',
  alignment: 'left',
  spacing: {
    paddingTop: 'lg',
    paddingBottom: 'lg',
  },
  textSize: 'base',
};

// =====================================================
// Module Metadata
// =====================================================

export const richTextV1Meta = {
  id: 'richText.v1',
  name: 'Zengin Metin',
  description: 'Formatlı metin içeriği - başlık, paragraf, liste desteği',
  category: 'content' as const,
  icon: 'Type',
  version: '1.0.0',
  tags: ['text', 'content', 'wysiwyg', 'paragraph'],
};

// =====================================================
// Components
// =====================================================

const maxWidthClasses: Record<string, string> = {
  sm: 'max-w-xl',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-full',
};

const textSizeClasses: Record<string, string> = {
  sm: 'prose-sm',
  base: 'prose',
  lg: 'prose-lg',
};

const spacingClasses: Record<string, string> = {
  none: 'py-0',
  sm: 'py-4 md:py-6',
  md: 'py-8 md:py-12',
  lg: 'py-12 md:py-16',
  xl: 'py-16 md:py-24',
};

function RichTextV1Render({
  block,
}: {
  block: { config: RichTextV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;

  const paddingTop = config.spacing?.paddingTop || 'md';
  const paddingBottom = config.spacing?.paddingBottom || 'md';

  return (
    <section
      className={`${spacingClasses[paddingTop].split(' ')[0]} ${spacingClasses[paddingBottom].split(' ')[1] || spacingClasses[paddingBottom].split(' ')[0]}`}
    >
      <div className="container-mobile">
        <div
          className={`
            ${maxWidthClasses[config.maxWidth]}
            ${config.alignment === 'center' ? 'mx-auto' : ''}
            ${config.alignment === 'right' ? 'ml-auto' : ''}
          `}
        >
          <div
            className={`
              ${textSizeClasses[config.textSize]}
              prose-headings:text-foreground
              prose-p:text-muted-foreground
              prose-strong:text-foreground
              prose-a:text-primary
              max-w-none
              text-${config.alignment}
            `}
            dangerouslySetInnerHTML={{ __html: config.content }}
          />
        </div>
      </div>
    </section>
  );
}

function RichTextV1Editor({
  config,
  onChange,
}: {
  config: RichTextV1Config;
  onChange: (config: RichTextV1Config) => void;
  blockId: string;
}) {
  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="text-sm font-medium">İçerik (HTML)</label>
        <textarea
          value={config.content}
          onChange={(e) => onChange({ ...config, content: e.target.value })}
          className="mt-1 h-48 w-full rounded-md border px-3 py-2 font-mono text-sm"
          placeholder="<p>İçeriğinizi buraya yazın...</p>"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Not: İleride WYSIWYG editör eklenecektir.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Maksimum Genişlik</label>
          <select
            value={config.maxWidth}
            onChange={(e) =>
              onChange({
                ...config,
                maxWidth: e.target.value as RichTextV1Config['maxWidth'],
              })
            }
            className="mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="sm">Küçük</option>
            <option value="md">Orta</option>
            <option value="lg">Geniş</option>
            <option value="xl">Çok Geniş</option>
            <option value="full">Tam</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Hizalama</label>
          <select
            value={config.alignment}
            onChange={(e) =>
              onChange({
                ...config,
                alignment: e.target.value as RichTextV1Config['alignment'],
              })
            }
            className="mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="left">Sol</option>
            <option value="center">Orta</option>
            <option value="right">Sağ</option>
            <option value="justify">İki Yana</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Module Definition
// =====================================================

export const richTextV1Module: ModuleDefinition<RichTextV1Config> = {
  meta: richTextV1Meta,
  configSchema: richTextV1ConfigSchema,
  defaultConfig: richTextV1DefaultConfig,
  Render: RichTextV1Render,
  Editor: RichTextV1Editor,
};
