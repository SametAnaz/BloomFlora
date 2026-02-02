/**
 * Video Module v1
 * Embedded video section
 */

import { z } from 'zod';

import type { ModuleDefinition } from '../../types';

// =====================================================
// Config Schema
// =====================================================

export const videoV1ConfigSchema = z.object({
  /** Section title */
  title: z.string().optional(),
  /** Section subtitle */
  subtitle: z.string().optional(),
  /** Video URL (YouTube or Vimeo) */
  videoUrl: z.string().min(1),
  /** Thumbnail image */
  thumbnail: z.string().optional(),
  /** Auto play */
  autoplay: z.boolean().default(false),
  /** Show controls */
  controls: z.boolean().default(true),
  /** Loop video */
  loop: z.boolean().default(false),
  /** Muted */
  muted: z.boolean().default(false),
  /** Aspect ratio */
  aspectRatio: z.enum(['16:9', '4:3', '21:9', '1:1']).default('16:9'),
  /** Max width */
  maxWidth: z.enum(['sm', 'md', 'lg', 'full']).default('lg'),
});

export type VideoV1Config = z.infer<typeof videoV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const videoV1DefaultConfig: VideoV1Config = {
  title: '',
  subtitle: '',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  autoplay: false,
  controls: true,
  loop: false,
  muted: false,
  aspectRatio: '16:9',
  maxWidth: 'lg',
};

// =====================================================
// Module Metadata
// =====================================================

export const videoV1Meta = {
  id: 'video.v1',
  name: 'Video',
  description: 'YouTube veya Vimeo video gömme',
  category: 'media' as const,
  icon: 'PlayCircle',
  version: '1.0.0',
  tags: ['video', 'youtube', 'vimeo', 'embed'],
};

// =====================================================
// Helper Functions
// =====================================================

function getVideoEmbedUrl(url: string, config: VideoV1Config): string | null {
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    const params = new URLSearchParams();
    if (config.autoplay) params.set('autoplay', '1');
    if (!config.controls) params.set('controls', '0');
    if (config.loop) params.set('loop', '1');
    if (config.muted) params.set('mute', '1');
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?${params.toString()}`;
  }

  // Vimeo
  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    const params = new URLSearchParams();
    if (config.autoplay) params.set('autoplay', '1');
    if (config.loop) params.set('loop', '1');
    if (config.muted) params.set('muted', '1');
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?${params.toString()}`;
  }

  return null;
}

// =====================================================
// Render Component
// =====================================================

function VideoV1Render({
  block,
}: {
  block: { config: VideoV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;

  const embedUrl = getVideoEmbedUrl(config.videoUrl, config);

  const aspectRatios: Record<string, string> = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '21:9': 'aspect-[21/9]',
    '1:1': 'aspect-square',
  };

  const maxWidths: Record<string, string> = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    full: 'max-w-full',
  };

  return (
    <section className="py-16 px-4 md:px-8">
      <div className={`mx-auto ${maxWidths[config.maxWidth]}`}>
        {/* Header */}
        {(config.title || config.subtitle) && (
          <div className="mb-8 text-center">
            {config.title && (
              <h2 className="text-3xl font-bold md:text-4xl">{config.title}</h2>
            )}
            {config.subtitle && (
              <p className="mt-3 text-lg text-muted-foreground">{config.subtitle}</p>
            )}
          </div>
        )}

        {/* Video */}
        <div
          className={`relative overflow-hidden rounded-xl bg-black ${
            aspectRatios[config.aspectRatio]
          }`}
        >
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={config.title || 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <p>Geçersiz video URL&apos;si</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// =====================================================
// Editor Component
// =====================================================

function VideoV1Editor({
  config,
  onChange,
}: {
  config: VideoV1Config;
  onChange: (config: VideoV1Config) => void;
}) {
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

      <div>
        <label className="mb-1 block text-sm font-medium">Video URL</label>
        <input
          type="text"
          placeholder="YouTube veya Vimeo linki"
          value={config.videoUrl}
          onChange={(e) => onChange({ ...config, videoUrl: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          YouTube veya Vimeo video linkini yapıştırın
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">En-Boy Oranı</label>
          <select
            value={config.aspectRatio}
            onChange={(e) =>
              onChange({
                ...config,
                aspectRatio: e.target.value as '16:9' | '4:3' | '21:9' | '1:1',
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="16:9">16:9 (Geniş)</option>
            <option value="4:3">4:3 (Klasik)</option>
            <option value="21:9">21:9 (Sinema)</option>
            <option value="1:1">1:1 (Kare)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Maksimum Genişlik</label>
          <select
            value={config.maxWidth}
            onChange={(e) =>
              onChange({
                ...config,
                maxWidth: e.target.value as 'sm' | 'md' | 'lg' | 'full',
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="sm">Küçük</option>
            <option value="md">Orta</option>
            <option value="lg">Büyük</option>
            <option value="full">Tam</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.autoplay}
            onChange={(e) => onChange({ ...config, autoplay: e.target.checked })}
          />
          <span className="text-sm">Otomatik Oynat</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.controls}
            onChange={(e) => onChange({ ...config, controls: e.target.checked })}
          />
          <span className="text-sm">Kontrolleri Göster</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.loop}
            onChange={(e) => onChange({ ...config, loop: e.target.checked })}
          />
          <span className="text-sm">Döngü</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.muted}
            onChange={(e) => onChange({ ...config, muted: e.target.checked })}
          />
          <span className="text-sm">Sessiz</span>
        </label>
      </div>
    </div>
  );
}

// =====================================================
// Module Definition
// =====================================================

export const videoV1Module: ModuleDefinition<VideoV1Config> = {
  meta: videoV1Meta,
  configSchema: videoV1ConfigSchema,
  defaultConfig: videoV1DefaultConfig,
  Render: VideoV1Render,
  Editor: VideoV1Editor,
};
