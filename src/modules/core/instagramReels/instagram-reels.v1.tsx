/**
 * Instagram Reels Module v1
 * Embedded Instagram Reel cards — clip-frame approach
 * Layouts: single | row | grid | slider | marquee
 */

import * as React from 'react';
import { z } from 'zod';

import { backgroundConfigSchema, type ModuleDefinition } from '../../types';

// =====================================================
// Config Schema
// =====================================================

export const instagramReelsV1ConfigSchema = z.object({
  title: z.string().optional(),
  /** Instagram profile URL — shown as a clickable badge below the title */
  profileUrl: z.string().optional(),
  /** Override display name (fallback: parsed from URL) */
  profileDisplayName: z.string().optional(),
  /** @deprecated – kept for backward compatibility */
  subtitle: z.string().optional(),
  /** Up to 10 reel URLs */
  reelUrls: z.array(z.string().min(1)).min(1).max(10),
  /** Display layout */
  layout: z.enum(['single', 'row', 'grid', 'slider', 'marquee']).default('single'),
  /** Grid columns (grid only) */
  columns: z.enum(['2', '3', '4']).default('2'),
  /** Gap between cards */
  gap: z.enum(['sm', 'md', 'lg']).default('md'),
  /** Card border radius */
  cardRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('lg'),
  /** Hover animation */
  hoverEffect: z.enum(['none', 'zoom', 'lift', 'glow', 'rotate']).default('none'),
  /** Entry animation */
  enterAnimation: z.enum(['none', 'fadeIn', 'slideUp', 'zoomIn']).default('none'),
  /** Slider: auto-play interval in seconds (0 = off) */
  autoPlay: z.number().min(0).max(30).default(0),
  /** Slider: show nav arrows */
  showArrows: z.boolean().default(true),
  /** Slider: loop */
  loop: z.boolean().default(true),
  /** Marquee scroll speed px/s */
  marqueeSpeed: z.number().min(10).max(200).default(40),
  /** Marquee direction */
  marqueeDirection: z.enum(['left', 'right']).default('left'),
  /** Pause marquee on hover */
  marqueePauseOnHover: z.boolean().default(true),
  /** Show Instagram caption */
  showCaption: z.boolean().default(false),
  background: backgroundConfigSchema.default({ type: 'none' }),
});

export type InstagramReelsV1Config = z.infer<typeof instagramReelsV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const instagramReelsV1DefaultConfig: InstagramReelsV1Config = {
  title: '',
  profileUrl: '',
  profileDisplayName: '',
  subtitle: '',
  reelUrls: ['https://www.instagram.com/reel/'],
  layout: 'single',
  columns: '2',
  gap: 'md',
  cardRadius: 'lg',
  hoverEffect: 'none',
  enterAnimation: 'none',
  autoPlay: 0,
  showArrows: true,
  loop: true,
  marqueeSpeed: 40,
  marqueeDirection: 'left',
  marqueePauseOnHover: true,
  showCaption: false,
  background: { type: 'none' as const },
};

// =====================================================
// Module Metadata
// =====================================================

export const instagramReelsV1Meta = {
  id: 'instagramReels.v1',
  name: 'Instagram Reels',
  description: 'Instagram Reels video göm',
  category: 'media' as const,
  icon: 'Instagram',
  version: '1.0.0',
  tags: ['instagram', 'reels', 'social', 'video', 'embed'],
};

// =====================================================
// Constants — iframe clipping measurements
// =====================================================

// At natural embed width of 400px:
//   header  ≈ 62px  (profile row — cropped via negative top offset)
//   video   ≈ 420px (visible area)
//   footer  ≈ 518px (actions/view more — cropped via overflow:hidden)
const IFRAME_W = 400;
const CROP_X = 60;               // crop each side to remove black bars
const CARD_W = IFRAME_W - CROP_X * 2; // 280px visible width
const HEADER_H = 62;
const VIDEO_H = 420;
const IFRAME_H = 1000; // tall enough to push footer outside container

// =====================================================
// Helper: extract shortcode from any Instagram URL
// =====================================================

function getShortcode(url: string): string | null {
  const match = url.trim().match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

function extractUsername(profileUrl: string): string {
  const match = profileUrl.trim().replace(/\/$/, '').match(/instagram\.com\/([^/?#]+)/);
  return match ? '@' + match[1] : '';
}

const radiusValues: Record<string, number> = { none: 0, sm: 6, md: 10, lg: 16, xl: 24 };
const gapValues: Record<string, number> = { sm: 12, md: 20, lg: 32 };

// =====================================================
// ReelCard — single clipped iframe
// =====================================================

function ReelCard({
  shortcode,
  config,
  idx,
}: {
  shortcode: string;
  config: InstagramReelsV1Config;
  idx: number;
}) {
  const src = `https://www.instagram.com/reel/${shortcode}/embed/${config.showCaption ? '?captioned' : ''}`;
  const radius = radiusValues[config.cardRadius] ?? 16;

  const enterClass: Record<string, string> = {
    none: '',
    fadeIn: 'ig-anim-fadeIn',
    slideUp: 'ig-anim-slideUp',
    zoomIn: 'ig-anim-zoomIn',
  };

  const hoverClass: Record<string, string> = {
    none: '',
    zoom: 'transition-transform duration-300 hover:scale-105',
    lift: 'transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl',
    glow: 'transition-shadow duration-300 hover:shadow-[0_0_28px_rgba(225,48,108,0.55)]',
    rotate: 'transition-transform duration-300 hover:rotate-1 hover:scale-[1.02]',
  };

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden ${hoverClass[config.hoverEffect] ?? ''} ${enterClass[config.enterAnimation] ?? ''}`}
      style={{
        width: CARD_W,
        height: VIDEO_H,
        borderRadius: radius,
        maxWidth: '100%',
        animationDelay: `${idx * 80}ms`,
        animationFillMode: 'both',
      }}
    >
      <iframe
        src={src}
        title={`Instagram Reel ${idx + 1}`}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        scrolling="no"
        style={{
          position: 'absolute',
          top: -HEADER_H,
          left: -CROP_X,
          width: IFRAME_W,
          height: IFRAME_H,
          border: 'none',
        }}
      />
    </div>
  );
}

// =====================================================
// Layout: Row
// =====================================================

function RowLayout({ shortcodes, config }: { shortcodes: string[]; config: InstagramReelsV1Config }) {
  const gap = gapValues[config.gap] ?? 20;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap }}>
      {shortcodes.map((sc, i) => (
        <ReelCard key={sc + i} shortcode={sc} config={config} idx={i} />
      ))}
    </div>
  );
}

// =====================================================
// Layout: Grid
// =====================================================

function GridLayout({ shortcodes, config }: { shortcodes: string[]; config: InstagramReelsV1Config }) {
  const cols = parseInt(config.columns, 10);
  const gap = gapValues[config.gap] ?? 20;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${CARD_W}px)`,
        gap,
        justifyContent: 'center',
      }}
    >
      {shortcodes.map((sc, i) => (
        <ReelCard key={sc + i} shortcode={sc} config={config} idx={i} />
      ))}
    </div>
  );
}

// =====================================================
// Layout: Slider
// =====================================================

function SliderLayout({ shortcodes, config }: { shortcodes: string[]; config: InstagramReelsV1Config }) {
  const [current, setCurrent] = React.useState(0);
  const total = shortcodes.length;

  const prev = React.useCallback(() => {
    setCurrent((i) => (config.loop ? (i - 1 + total) % total : Math.max(i - 1, 0)));
  }, [config.loop, total]);

  const next = React.useCallback(() => {
    setCurrent((i) => (config.loop ? (i + 1) % total : Math.min(i + 1, total - 1)));
  }, [config.loop, total]);

  React.useEffect(() => {
    if (!config.autoPlay || config.autoPlay <= 0) return;
    const id = setInterval(next, config.autoPlay * 1000);
    return () => clearInterval(id);
  }, [config.autoPlay, next]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {config.showArrows && total > 1 && (
          <button
            onClick={prev}
            disabled={!config.loop && current === 0}
            className="rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-30"
            aria-label="Önceki"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <ReelCard shortcode={shortcodes[current]} config={config} idx={current} />
        {config.showArrows && total > 1 && (
          <button
            onClick={next}
            disabled={!config.loop && current === total - 1}
            className="rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-30"
            aria-label="Sonraki"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      {total > 1 && (
        <div style={{ display: 'flex', gap: 6 }}>
          {shortcodes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
              aria-label={`Reel ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Layout: Marquee
// =====================================================

function MarqueeLayout({ shortcodes, config }: { shortcodes: string[]; config: InstagramReelsV1Config }) {
  const gap = gapValues[config.gap] ?? 20;
  const slotW = CARD_W + gap;
  const singleSetPx = shortcodes.length * slotW;
  const duration = (singleSetPx * shortcodes.length) / config.marqueeSpeed;
  const animName = `ig-marquee-${config.marqueeDirection}`;
  const items = [...shortcodes, ...shortcodes, ...shortcodes];

  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <style>{`
        @keyframes ig-marquee-left  { from { transform: translateX(0); } to { transform: translateX(-${singleSetPx}px); } }
        @keyframes ig-marquee-right { from { transform: translateX(-${singleSetPx}px); } to { transform: translateX(0); } }
      `}</style>
      <div
        className={config.marqueePauseOnHover ? 'hover:[animation-play-state:paused]' : ''}
        style={{
          display: 'flex',
          gap,
          width: 'max-content',
          animationName: animName,
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}
      >
        {items.map((sc, i) => (
          <ReelCard key={sc + i} shortcode={sc} config={config} idx={i} />
        ))}
      </div>
    </div>
  );
}

// =====================================================
// Render Component
// =====================================================

function InstagramReelsV1Render({
  block,
}: {
  block: { config: InstagramReelsV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;

  const validShortcodes = config.reelUrls
    .map((u) => getShortcode(u))
    .filter((s): s is string => s !== null);

  const { getBackgroundStyle, needsOverlay } = require('../../shared/background-picker') as typeof import('../../shared/background-picker');
  const bgStyle = getBackgroundStyle(config.background as import('../../shared/background-picker').BackgroundConfig);
  const showOverlay = needsOverlay(config.background as import('../../shared/background-picker').BackgroundConfig);

  const displayed = config.layout === 'single' ? validShortcodes.slice(0, 1) : validShortcodes;

  return (
    <section className="relative py-16 px-4 md:px-8" style={bgStyle}>
      {config.enterAnimation !== 'none' && (
        <style>{`
          @keyframes ig-fadeIn  { from { opacity:0 } to { opacity:1 } }
          @keyframes ig-slideUp { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
          @keyframes ig-zoomIn  { from { opacity:0; transform:scale(0.82) } to { opacity:1; transform:scale(1) } }
          .ig-anim-fadeIn  { animation: ig-fadeIn  0.55s ease both; }
          .ig-anim-slideUp { animation: ig-slideUp 0.55s ease both; }
          .ig-anim-zoomIn  { animation: ig-zoomIn  0.55s ease both; }
        `}</style>
      )}
      {showOverlay && (
        <div
          className="absolute inset-0 bg-black/50"
          style={{ opacity: ((config.background as Record<string, unknown>)?.overlayOpacity as number ?? 40) / 100 }}
        />
      )}
      <div className="relative z-10 mx-auto max-w-5xl">
        {config.title && (
          <div className="mb-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">{config.title}</h2>
          </div>
        )}

        {/* Instagram Profile Badge */}
        {config.profileUrl && (
          <div className="mb-8 flex justify-center">
            <a
              href={config.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur transition hover:bg-white/20"
            >
              {/* Instagram gradient icon */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4.5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <span className="text-sm font-semibold">
                {config.profileDisplayName || extractUsername(config.profileUrl)}
              </span>
              <svg className="h-3.5 w-3.5 opacity-50 transition group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        )}

        {validShortcodes.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
            Geçerli bir Instagram Reels URL&apos;si girilmedi
          </div>
        ) : config.layout === 'single' ? (
          <div className="flex justify-center">
            <ReelCard shortcode={displayed[0]} config={config} idx={0} />
          </div>
        ) : config.layout === 'row' ? (
          <RowLayout shortcodes={displayed} config={config} />
        ) : config.layout === 'grid' ? (
          <GridLayout shortcodes={displayed} config={config} />
        ) : config.layout === 'slider' ? (
          <SliderLayout shortcodes={displayed} config={config} />
        ) : (
          <MarqueeLayout shortcodes={displayed} config={config} />
        )}
      </div>
    </section>
  );
}

// =====================================================
// Editor Component
// =====================================================

function InstagramReelsV1Editor({
  config,
  onChange,
}: {
  config: InstagramReelsV1Config;
  onChange: (config: InstagramReelsV1Config) => void;
}) {
  function updateUrl(idx: number, value: string) {
    const urls = [...config.reelUrls];
    urls[idx] = value;
    onChange({ ...config, reelUrls: urls });
  }

  function addUrl() {
    if (config.reelUrls.length >= 10) return;
    onChange({ ...config, reelUrls: [...config.reelUrls, ''] });
  }

  function removeUrl(idx: number) {
    if (config.reelUrls.length <= 1) return;
    onChange({ ...config, reelUrls: config.reelUrls.filter((_, i) => i !== idx) });
  }

  const inputCls = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm';
  const labelCls = 'mb-1 block text-sm font-medium';

  return (
    <div className="space-y-4">
      <InstagramBackgroundPicker
        value={config.background as import('../../shared/background-picker').BackgroundConfig}
        onChange={(bg: import('../../shared/background-picker').BackgroundConfig) => onChange({ ...config, background: bg })}
      />

      <div>
        <label className={labelCls}>Başlık</label>
        <input type="text" value={config.title || ''} onChange={(e) => onChange({ ...config, title: e.target.value })} className={inputCls} />
      </div>

      {/* Instagram Profile */}
      <div className="space-y-3 rounded-md border border-input p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Instagram Profil</p>
        <div>
          <label className={labelCls}>Profil Linki</label>
          <input
            type="text"
            placeholder="https://www.instagram.com/hesabınız/"
            value={config.profileUrl || ''}
            onChange={(e) => onChange({ ...config, profileUrl: e.target.value })}
            className={inputCls}
          />
          <p className="mt-1 text-xs text-muted-foreground">Linki yapıştırınca kullanıcı adı otomatik çekilir</p>
        </div>
        <div>
          <label className={labelCls}>Görünen Ad (opsiyonel)</label>
          <input
            type="text"
            placeholder="@bloomflorarize"
            value={config.profileDisplayName || ''}
            onChange={(e) => onChange({ ...config, profileDisplayName: e.target.value })}
            className={inputCls}
          />
        </div>
        {/* Live preview */}
        {config.profileUrl && (
          <div className="flex items-center gap-2.5 rounded-full border border-input bg-muted/50 px-4 py-2 w-fit">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600">
              <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <span className="text-sm font-semibold">
              {config.profileDisplayName || extractUsername(config.profileUrl)}
            </span>
          </div>
        )}
      </div>

      {/* Reel URLs */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Instagram Reel URL&apos;leri ({config.reelUrls.length}/10)
        </label>
        <div className="space-y-2">
          {config.reelUrls.map((url, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                placeholder="https://www.instagram.com/reel/..."
                value={url}
                onChange={(e) => updateUrl(idx, e.target.value)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              {config.reelUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrl(idx)}
                  className="rounded-md border border-input bg-background px-2 py-2 text-sm text-destructive hover:bg-destructive/10"
                  title="Kaldır"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {config.reelUrls.length < 10 && (
          <button
            type="button"
            onClick={addUrl}
            className="mt-2 rounded-md border border-dashed border-input px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary"
          >
            + Reel Ekle
          </button>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Kopyala → Paylaş → Bağlantıyı kopyala linkini yapıştırın
        </p>
      </div>

      {/* Layout */}
      <div>
        <label className={labelCls}>Görünüm</label>
        <select
          value={config.layout}
          onChange={(e) => onChange({ ...config, layout: e.target.value as InstagramReelsV1Config['layout'] })}
          className={inputCls}
        >
          <option value="single">Tek</option>
          <option value="row">Yan Yana</option>
          <option value="grid">Izgara</option>
          <option value="slider">Slayt (Slider)</option>
          <option value="marquee">Kayan Bant</option>
        </select>
      </div>

      {/* Grid columns */}
      {config.layout === 'grid' && (
        <div>
          <label className={labelCls}>Sütun Sayısı</label>
          <select
            value={config.columns}
            onChange={(e) => onChange({ ...config, columns: e.target.value as '2' | '3' | '4' })}
            className={inputCls}
          >
            <option value="2">2 Sütun</option>
            <option value="3">3 Sütun</option>
            <option value="4">4 Sütun</option>
          </select>
        </div>
      )}

      {/* Gap */}
      {config.layout !== 'single' && (
        <div>
          <label className={labelCls}>Boşluk</label>
          <select
            value={config.gap}
            onChange={(e) => onChange({ ...config, gap: e.target.value as 'sm' | 'md' | 'lg' })}
            className={inputCls}
          >
            <option value="sm">Az</option>
            <option value="md">Orta</option>
            <option value="lg">Geniş</option>
          </select>
        </div>
      )}

      {/* Card Radius */}
      <div>
        <label className={labelCls}>Köşe Yuvarlaklığı</label>
        <select
          value={config.cardRadius}
          onChange={(e) => onChange({ ...config, cardRadius: e.target.value as InstagramReelsV1Config['cardRadius'] })}
          className={inputCls}
        >
          <option value="none">Köşeli</option>
          <option value="sm">Az</option>
          <option value="md">Orta</option>
          <option value="lg">Yuvarlak</option>
          <option value="xl">Çok Yuvarlak</option>
        </select>
      </div>

      {/* Hover Effect */}
      <div>
        <label className={labelCls}>Hover Efekti</label>
        <select
          value={config.hoverEffect}
          onChange={(e) => onChange({ ...config, hoverEffect: e.target.value as InstagramReelsV1Config['hoverEffect'] })}
          className={inputCls}
        >
          <option value="none">Yok</option>
          <option value="zoom">Yakınlaştır</option>
          <option value="lift">Yukarı Kaldır</option>
          <option value="glow">Parıltı (Pembe)</option>
          <option value="rotate">Hafif Döndür</option>
        </select>
      </div>

      {/* Enter Animation */}
      <div>
        <label className={labelCls}>Giriş Animasyonu</label>
        <select
          value={config.enterAnimation}
          onChange={(e) => onChange({ ...config, enterAnimation: e.target.value as InstagramReelsV1Config['enterAnimation'] })}
          className={inputCls}
        >
          <option value="none">Yok</option>
          <option value="fadeIn">Belirme (Fade In)</option>
          <option value="slideUp">Yukarı Kayma</option>
          <option value="zoomIn">Yakınlaştırma</option>
        </select>
      </div>

      {/* Slider settings */}
      {config.layout === 'slider' && (
        <div className="space-y-3 rounded-md border border-input p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Slider Ayarları</p>
          <div>
            <label className={labelCls}>Otomatik Geçiş (saniye, 0 = kapalı)</label>
            <input
              type="number"
              min={0}
              max={30}
              value={config.autoPlay ?? 0}
              onChange={(e) => onChange({ ...config, autoPlay: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={config.showArrows} onChange={(e) => onChange({ ...config, showArrows: e.target.checked })} />
            <span className="text-sm">Ok Butonları</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={config.loop} onChange={(e) => onChange({ ...config, loop: e.target.checked })} />
            <span className="text-sm">Döngü</span>
          </label>
        </div>
      )}

      {/* Marquee settings */}
      {config.layout === 'marquee' && (
        <div className="space-y-3 rounded-md border border-input p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kayan Bant Ayarları</p>
          <div>
            <label className={labelCls}>Hız (px/s)</label>
            <input
              type="number"
              min={10}
              max={200}
              value={config.marqueeSpeed ?? 40}
              onChange={(e) => onChange({ ...config, marqueeSpeed: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Yön</label>
            <select
              value={config.marqueeDirection}
              onChange={(e) => onChange({ ...config, marqueeDirection: e.target.value as 'left' | 'right' })}
              className={inputCls}
            >
              <option value="left">Sola</option>
              <option value="right">Sağa</option>
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.marqueePauseOnHover}
              onChange={(e) => onChange({ ...config, marqueePauseOnHover: e.target.checked })}
            />
            <span className="text-sm">Hover&apos;da Duraklat</span>
          </label>
        </div>
      )}

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.showCaption ?? false}
          onChange={(e) => onChange({ ...config, showCaption: e.target.checked })}
        />
        <span className="text-sm">Instagram Açıklamasını Göster</span>
      </label>
    </div>
  );
}

/** Background picker wrapper */
function InstagramBackgroundPicker(props: {
  value: import('../../shared/background-picker').BackgroundConfig;
  onChange: (bg: import('../../shared/background-picker').BackgroundConfig) => void;
}) {
  const { BackgroundPicker } = require('../../shared/background-picker') as typeof import('../../shared/background-picker');
  return <BackgroundPicker value={props.value} onChange={props.onChange} imageFolder="instagram-reels" />;
}

// =====================================================
// Module Definition
// =====================================================

export const instagramReelsV1Module: ModuleDefinition<InstagramReelsV1Config> = {
  meta: instagramReelsV1Meta,
  configSchema: instagramReelsV1ConfigSchema,
  defaultConfig: instagramReelsV1DefaultConfig,
  Render: InstagramReelsV1Render,
  Editor: InstagramReelsV1Editor,
};
