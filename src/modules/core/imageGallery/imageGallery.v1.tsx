/**
 * Image Gallery Module v1
 * Advanced gallery with multiple display modes:
 *  - grid: standard responsive grid
 *  - masonry: Pinterest-style staggered layout
 *  - slider: carousel / slideshow with auto-play
 *  - booklet: 3D page-flip book
 *  - marquee: continuous scrolling ticker
 */

import * as React from 'react';
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
  /** Gallery subtitle */
  subtitle: z.string().optional(),
  /** Gallery images */
  images: z.array(imageRefSchema).min(1),

  // ── Display mode ──────────────────────────────────
  displayMode: z.enum(['grid', 'masonry', 'slider', 'booklet', 'marquee']).default('grid'),

  // ── Grid / Masonry settings ───────────────────────
  /** Grid columns on desktop */
  columns: z.enum(['2', '3', '4', '5']).default('3'),
  /** Image aspect ratio (grid only) */
  aspectRatio: z.enum(['square', '4:3', '16:9', '3:4', 'auto']).default('square'),
  /** Gap between images */
  gap: z.enum(['none', 'sm', 'md', 'lg']).default('md'),
  /** Rounded corners */
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl', 'full']).default('md'),

  // ── Slider settings ───────────────────────────────
  /** Auto-play interval in seconds (0 = off) */
  autoPlay: z.number().min(0).max(30).default(0),
  /** Transition type for slider/booklet */
  transition: z.enum(['slide', 'fade', 'zoom', 'flip']).default('slide'),
  /** Transition speed in ms */
  transitionSpeed: z.number().min(200).max(2000).default(500),
  /** Show navigation arrows */
  showArrows: z.boolean().default(true),
  /** Show dot indicators */
  showDots: z.boolean().default(true),
  /** Slides per view (slider only) */
  slidesPerView: z.enum(['1', '2', '3']).default('1'),
  /** Infinite loop */
  loop: z.boolean().default(true),

  // ── Marquee settings ──────────────────────────────
  /** Marquee scroll speed (pixels per second) */
  marqueeSpeed: z.number().min(10).max(200).default(50),
  /** Marquee direction */
  marqueeDirection: z.enum(['left', 'right']).default('left'),
  /** Pause marquee on hover */
  marqueePauseOnHover: z.boolean().default(true),
  /** Marquee image height in px */
  marqueeHeight: z.number().min(60).max(500).default(200),

  // ── Hover animation ───────────────────────────────
  hoverEffect: z.enum(['none', 'zoom', 'fade', 'slideUp', 'rotate', 'blurReveal', 'tilt', 'shine']).default('zoom'),

  // ── Caption overlay ───────────────────────────────
  showCaptions: z.boolean().default(false),
  captionPosition: z.enum(['bottom', 'center', 'overlay']).default('bottom'),

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
  subtitle: '',
  images: [
    { src: '/placeholder-1.jpg', alt: 'Görsel 1' },
    { src: '/placeholder-2.jpg', alt: 'Görsel 2' },
    { src: '/placeholder-3.jpg', alt: 'Görsel 3' },
    { src: '/placeholder-4.jpg', alt: 'Görsel 4' },
    { src: '/placeholder-5.jpg', alt: 'Görsel 5' },
    { src: '/placeholder-6.jpg', alt: 'Görsel 6' },
  ],
  displayMode: 'grid',
  columns: '3',
  aspectRatio: 'square',
  gap: 'md',
  borderRadius: 'md',
  autoPlay: 0,
  transition: 'slide',
  transitionSpeed: 500,
  showArrows: true,
  showDots: true,
  slidesPerView: '1',
  loop: true,
  marqueeSpeed: 50,
  marqueeDirection: 'left',
  marqueePauseOnHover: true,
  marqueeHeight: 200,
  hoverEffect: 'zoom',
  showCaptions: false,
  captionPosition: 'bottom',
  lightbox: true,
  spacing: { paddingTop: 'lg', paddingBottom: 'lg' },
  background: { type: 'none' },
};

// =====================================================
// Module Metadata
// =====================================================

export const imageGalleryV1Meta = {
  id: 'imageGallery.v1',
  name: 'Görsel Galeri',
  description: 'Çoklu görünüm: ızgara, masonry, slayt, kitapçık, kayan bant',
  category: 'media' as const,
  icon: 'Images',
  version: '1.0.0',
  tags: ['gallery', 'images', 'photos', 'grid', 'slider', 'booklet', 'masonry', 'marquee'],
};

// =====================================================
// Utility maps
// =====================================================

const columnClasses: Record<string, string> = {
  '2': 'grid-cols-2',
  '3': 'grid-cols-2 md:grid-cols-3',
  '4': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  '5': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
};

const gapClasses: Record<string, string> = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

const aspectClasses: Record<string, string> = {
  square: 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  '3:4': 'aspect-[3/4]',
  auto: '',
};

const radiusClasses: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-3xl',
};

// Hover effect CSS classes (applied on image wrapper)
const hoverEffectClasses: Record<string, string> = {
  none: '',
  zoom: '[&_img]:transition-transform [&_img]:duration-500 [&:hover_img]:scale-110',
  fade: '[&_img]:transition-opacity [&_img]:duration-500 [&:hover_img]:opacity-80',
  slideUp: '[&_img]:transition-transform [&_img]:duration-500 [&:hover_img]:-translate-y-2',
  rotate: '[&_img]:transition-transform [&_img]:duration-500 [&:hover_img]:rotate-3 [&:hover_img]:scale-105',
  blurReveal: '[&_img]:blur-[2px] [&_img]:transition-all [&_img]:duration-500 [&:hover_img]:blur-0',
  tilt: '[&_img]:transition-transform [&_img]:duration-500 [&:hover_img]:[transform:perspective(600px)_rotateY(8deg)]',
  shine: 'gallery-shine',
};

// =====================================================
// Lightbox Component
// =====================================================

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: ImageRef[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = React.useState(startIndex);
  const img = images[idx];

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx((p) => (p + 1) % images.length);
      if (e.key === 'ArrowLeft') setIdx((p) => (p - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/80 hover:text-white" aria-label="Kapat">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((p) => (p - 1 + images.length) % images.length); }}
            className="absolute left-4 z-10 rounded-full bg-white/10 p-2 text-white/80 backdrop-blur hover:bg-white/20 hover:text-white"
            aria-label="Önceki"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((p) => (p + 1) % images.length); }}
            className="absolute right-4 z-10 rounded-full bg-white/10 p-2 text-white/80 backdrop-blur hover:bg-white/20 hover:text-white"
            aria-label="Sonraki"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.src}
        alt={img.alt}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      {images.length > 1 && (
        <div className="absolute bottom-4 text-sm text-white/60">{idx + 1} / {images.length}</div>
      )}
    </div>
  );
}

// =====================================================
// Sub-renderers for each display mode
// =====================================================

/** Image card with hover effect + caption */
function GalleryImage({
  image,
  index,
  config,
  onClick,
}: {
  image: ImageRef;
  index: number;
  config: ImageGalleryV1Config;
  onClick?: () => void;
}) {
  return (
    <div
      className={`group relative overflow-hidden bg-muted ${radiusClasses[config.borderRadius]} ${aspectClasses[config.aspectRatio]} ${hoverEffectClasses[config.hoverEffect]} ${config.lightbox || onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      {/* Caption */}
      {config.showCaptions && image.alt && (
        <div
          className={`absolute inset-x-0 transition-all duration-300 ${
            config.captionPosition === 'center'
              ? 'inset-y-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40'
              : config.captionPosition === 'overlay'
              ? 'bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3'
              : 'bottom-0 bg-black/50 p-2 translate-y-full group-hover:translate-y-0'
          }`}
        >
          <span className={`text-sm font-medium text-white ${config.captionPosition === 'center' ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}>
            {image.alt}
          </span>
        </div>
      )}
      {/* Shine overlay (CSS driven) */}
      {config.hoverEffect === 'shine' && (
        <div className="pointer-events-none absolute inset-0 gallery-shine-overlay" />
      )}
      {/* Lightbox icon */}
      {config.lightbox && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
          <svg className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ── Grid Mode ────────────────────────────────────────
function GridGallery({ config, onImageClick }: { config: ImageGalleryV1Config; onImageClick: (i: number) => void }) {
  return (
    <div className={`grid ${columnClasses[config.columns]} ${gapClasses[config.gap]}`}>
      {config.images.map((image, index) => (
        <GalleryImage key={index} image={image} index={index} config={config} onClick={() => onImageClick(index)} />
      ))}
    </div>
  );
}

// ── Masonry Mode ─────────────────────────────────────
function MasonryGallery({ config, onImageClick }: { config: ImageGalleryV1Config; onImageClick: (i: number) => void }) {
  const cols = parseInt(config.columns, 10);
  const buckets = React.useMemo(() => {
    const b: ImageRef[][] = Array.from({ length: cols }, () => []);
    const idxMap: number[][] = Array.from({ length: cols }, () => []);
    config.images.forEach((img, i) => {
      const col = i % cols;
      b[col].push(img);
      idxMap[col].push(i);
    });
    return { cols: b, idxMap };
  }, [config.images, cols]);

  const gapCls = gapClasses[config.gap];

  return (
    <div className={`flex ${gapCls}`}>
      {buckets.cols.map((colImages, ci) => (
        <div key={ci} className={`flex-1 space-y-${config.gap === 'none' ? '0' : config.gap === 'sm' ? '2' : config.gap === 'lg' ? '6' : '4'}`}>
          {colImages.map((image, ri) => {
            const realIdx = buckets.idxMap[ci][ri];
            return (
              <div
                key={ri}
                className={`group relative overflow-hidden bg-muted ${radiusClasses[config.borderRadius]} ${hoverEffectClasses[config.hoverEffect]} ${config.lightbox ? 'cursor-pointer' : ''}`}
                onClick={() => onImageClick(realIdx)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt={image.alt} className="w-full object-cover" loading="lazy" />
                {config.showCaptions && image.alt && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2 translate-y-full transition-transform group-hover:translate-y-0">
                    <span className="text-sm font-medium text-white">{image.alt}</span>
                  </div>
                )}
                {config.hoverEffect === 'shine' && <div className="pointer-events-none absolute inset-0 gallery-shine-overlay" />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Slider Mode ──────────────────────────────────────
function SliderGallery({ config, onImageClick }: { config: ImageGalleryV1Config; onImageClick: (i: number) => void }) {
  const slidesPerView = parseInt(config.slidesPerView, 10);
  const total = config.images.length;
  const [current, setCurrent] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const maxIndex = Math.max(0, total - slidesPerView);

  const goTo = React.useCallback((idx: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    let next = idx;
    if (config.loop) {
      next = ((idx % total) + total) % total;
      if (next > maxIndex) next = 0;
    } else {
      next = Math.min(maxIndex, Math.max(0, idx));
    }
    setCurrent(next);
    setTimeout(() => setIsAnimating(false), config.transitionSpeed);
  }, [isAnimating, config.loop, config.transitionSpeed, maxIndex, total]);

  const next = React.useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = React.useCallback(() => goTo(current - 1), [goTo, current]);

  // Auto-play
  React.useEffect(() => {
    if (config.autoPlay > 0) {
      timerRef.current = setInterval(next, config.autoPlay * 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [config.autoPlay, next]);

  const transitionStyle: React.CSSProperties =
    config.transition === 'fade'
      ? { transition: `opacity ${config.transitionSpeed}ms ease` }
      : config.transition === 'zoom'
      ? { transition: `transform ${config.transitionSpeed}ms ease, opacity ${config.transitionSpeed}ms ease` }
      : { transition: `transform ${config.transitionSpeed}ms ease` };

  const slideWidth = 100 / slidesPerView;

  return (
    <div className="relative group/slider">
      {/* Track */}
      <div className={`overflow-hidden ${radiusClasses[config.borderRadius]}`}>
        {config.transition === 'fade' ? (
          /* Fade mode: stack slides */
          <div className="relative" style={{ aspectRatio: config.aspectRatio === 'auto' ? '16/9' : config.aspectRatio === 'square' ? '1' : config.aspectRatio === '4:3' ? '4/3' : config.aspectRatio === '3:4' ? '3/4' : '16/9' }}>
            {config.images.map((image, index) => (
              <div
                key={index}
                className="absolute inset-0"
                style={{ ...transitionStyle, opacity: index === current ? 1 : 0, zIndex: index === current ? 1 : 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  className={`h-full w-full object-cover ${config.lightbox ? 'cursor-pointer' : ''}`}
                  onClick={() => onImageClick(index)}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Slide / zoom mode: horizontal track */
          <div
            className="flex"
            style={{
              ...transitionStyle,
              transform: config.transition === 'zoom'
                ? `translateX(-${current * slideWidth}%) scale(${isAnimating ? 0.95 : 1})`
                : `translateX(-${current * slideWidth}%)`,
            }}
          >
            {config.images.map((image, index) => (
              <div
                key={index}
                className={`flex-shrink-0 ${gapClasses[config.gap] ? 'px-1' : ''}`}
                style={{ width: `${slideWidth}%` }}
              >
                <div className={`overflow-hidden ${radiusClasses[config.borderRadius]} ${hoverEffectClasses[config.hoverEffect]}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    className={`w-full object-cover ${config.lightbox ? 'cursor-pointer' : ''}`}
                    style={{ aspectRatio: config.aspectRatio === 'auto' ? undefined : config.aspectRatio === 'square' ? '1' : config.aspectRatio === '4:3' ? '4/3' : config.aspectRatio === '3:4' ? '3/4' : '16/9' }}
                    onClick={() => onImageClick(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Arrows */}
      {config.showArrows && total > slidesPerView && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md backdrop-blur transition hover:bg-white dark:bg-black/50 dark:text-white dark:hover:bg-black/70 opacity-0 group-hover/slider:opacity-100"
            aria-label="Önceki"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md backdrop-blur transition hover:bg-white dark:bg-black/50 dark:text-white dark:hover:bg-black/70 opacity-0 group-hover/slider:opacity-100"
            aria-label="Sonraki"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}

      {/* Dots */}
      {config.showDots && total > slidesPerView && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all ${i === current ? 'w-6 bg-primary' : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
              aria-label={`Slayt ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Booklet (page-flip) Mode ─────────────────────────
function BookletGallery({ config, onImageClick }: { config: ImageGalleryV1Config; onImageClick: (i: number) => void }) {
  const [page, setPage] = React.useState(0);
  const [flipping, setFlipping] = React.useState<'next' | 'prev' | null>(null);
  const total = config.images.length;
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const goNext = React.useCallback(() => {
    if (flipping) return;
    setFlipping('next');
    setTimeout(() => {
      setPage((p) => (p + 1) % total);
      setFlipping(null);
    }, config.transitionSpeed);
  }, [flipping, total, config.transitionSpeed]);

  const goPrev = React.useCallback(() => {
    if (flipping) return;
    setFlipping('prev');
    setTimeout(() => {
      setPage((p) => (p - 1 + total) % total);
      setFlipping(null);
    }, config.transitionSpeed);
  }, [flipping, total, config.transitionSpeed]);

  // Auto-play
  React.useEffect(() => {
    if (config.autoPlay > 0) {
      timerRef.current = setInterval(goNext, config.autoPlay * 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [config.autoPlay, goNext]);

  const curr = config.images[page];
  const nextImg = config.images[(page + 1) % total];

  return (
    <div className="relative mx-auto" style={{ maxWidth: 700, perspective: 1200 }}>
      <div
        className={`relative mx-auto overflow-hidden ${radiusClasses[config.borderRadius]} shadow-2xl`}
        style={{ aspectRatio: '4/3' }}
      >
        {/* Current page */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={curr.src}
          alt={curr.alt}
          className={`h-full w-full object-cover ${config.lightbox ? 'cursor-pointer' : ''}`}
          onClick={() => onImageClick(page)}
        />
        {/* Flipping page overlay */}
        {flipping && (
          <div
            className="absolute inset-0 origin-left"
            style={{
              animation: `${flipping === 'next' ? 'gallery-flip-next' : 'gallery-flip-prev'} ${config.transitionSpeed}ms ease-in-out forwards`,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={flipping === 'next' ? nextImg.src : config.images[(page - 1 + total) % total].src}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        {/* Page shadow */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={goPrev}
          className="rounded-full bg-muted p-2 text-foreground transition hover:bg-muted/80"
          aria-label="Önceki sayfa"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-sm text-muted-foreground">{page + 1} / {total}</span>
        <button
          onClick={goNext}
          className="rounded-full bg-muted p-2 text-foreground transition hover:bg-muted/80"
          aria-label="Sonraki sayfa"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

// ── Marquee (continuous scroll) Mode ─────────────────
function MarqueeGallery({ config, onImageClick }: { config: ImageGalleryV1Config; onImageClick: (i: number) => void }) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [paused, setPaused] = React.useState(false);

  // We duplicate images for seamless loop
  const doubled = React.useMemo(() => [...config.images, ...config.images], [config.images]);
  const isRight = config.marqueeDirection === 'right';

  // Calculate animation duration based on speed
  const singleWidth = config.images.length * (config.marqueeHeight * 1.5 + 16); // approx
  const duration = singleWidth / config.marqueeSpeed;

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => config.marqueePauseOnHover && setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex gap-4 gallery-marquee"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: isRight ? 'reverse' : 'normal',
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {doubled.map((image, index) => (
          <div
            key={index}
            className={`flex-shrink-0 overflow-hidden ${radiusClasses[config.borderRadius]} ${hoverEffectClasses[config.hoverEffect]} ${config.lightbox ? 'cursor-pointer' : ''}`}
            style={{ height: config.marqueeHeight }}
            onClick={() => onImageClick(index % config.images.length)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              className="h-full w-auto object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// Main Render Component
// =====================================================

function ImageGalleryV1Render({
  block,
}: {
  block: { config: ImageGalleryV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  const openLightbox = React.useCallback((i: number) => {
    if (config.lightbox) setLightboxIndex(i);
  }, [config.lightbox]);

  const bgStyle = (() => {
    const { getBackgroundStyle } = require('../../shared/background-picker') as { getBackgroundStyle: typeof import('../../shared/background-picker').getBackgroundStyle };
    return getBackgroundStyle(config.background as import('../../shared/background-picker').BackgroundConfig);
  })();
  const bgOverlay = typeof config.background === 'object' && (config.background as import('../../shared/background-picker').BackgroundConfig).overlayOpacity;

  return (
    <section className="relative py-12 md:py-16" style={bgStyle}>
      {bgOverlay ? <div className="absolute inset-0 bg-black" style={{ opacity: ((config.background as import('../../shared/background-picker').BackgroundConfig).overlayOpacity ?? 0) / 100 }} /> : null}
      <div className="relative z-10 container-mobile">
        {/* Header */}
        {(config.title || config.subtitle) && (
          <div className="mb-8">
            {config.title && <h2 className="text-2xl font-bold md:text-3xl">{config.title}</h2>}
            {config.subtitle && <p className="mt-2 text-muted-foreground">{config.subtitle}</p>}
          </div>
        )}

        {/* Gallery */}
        {config.displayMode === 'grid' && <GridGallery config={config} onImageClick={openLightbox} />}
        {config.displayMode === 'masonry' && <MasonryGallery config={config} onImageClick={openLightbox} />}
        {config.displayMode === 'slider' && <SliderGallery config={config} onImageClick={openLightbox} />}
        {config.displayMode === 'booklet' && <BookletGallery config={config} onImageClick={openLightbox} />}
        {config.displayMode === 'marquee' && <MarqueeGallery config={config} onImageClick={openLightbox} />}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox images={config.images} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </section>
  );
}

// =====================================================
// Editor Component
// =====================================================

function ImageGalleryV1Editor({
  config,
  onChange,
}: {
  config: ImageGalleryV1Config;
  onChange: (config: ImageGalleryV1Config) => void;
  blockId: string;
}) {
  const set = <K extends keyof ImageGalleryV1Config>(key: K, value: ImageGalleryV1Config[K]) =>
    onChange({ ...config, [key]: value });

  const addImage = () => set('images', [...config.images, { src: '/placeholder.jpg', alt: 'Yeni görsel' }]);

  const removeImage = (index: number) => set('images', config.images.filter((_, i) => i !== index));

  const updateImage = (index: number, updates: Partial<ImageRef>) => {
    const newImages = [...config.images];
    newImages[index] = { ...newImages[index], ...updates };
    set('images', newImages);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.images.length) return;
    const newImages = [...config.images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    set('images', newImages);
  };

  const inputCls = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm';
  const showGrid = config.displayMode === 'grid' || config.displayMode === 'masonry';
  const showSlider = config.displayMode === 'slider';
  const showBooklet = config.displayMode === 'booklet';
  const showMarquee = config.displayMode === 'marquee';

  return (
    <div className="space-y-4 p-4">
      {/* ── Title / Subtitle ── */}
      <div>
        <label className="mb-1 block text-sm font-medium">Başlık</label>
        <input type="text" value={config.title || ''} onChange={(e) => set('title', e.target.value)} className={inputCls} placeholder="Galeri başlığı" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Alt Başlık</label>
        <input type="text" value={config.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} className={inputCls} placeholder="İsteğe bağlı" />
      </div>

      {/* ── Display Mode ── */}
      <div>
        <label className="mb-1 block text-sm font-medium">Görünüm Modu</label>
        <div className="grid grid-cols-5 gap-1.5">
          {([
            ['grid', 'Izgara', '⊞'],
            ['masonry', 'Masonry', '⧈'],
            ['slider', 'Slayt', '⊳'],
            ['booklet', 'Kitapçık', '📖'],
            ['marquee', 'Kayan', '↔'],
          ] as const).map(([mode, label, icon]) => (
            <button
              key={mode}
              type="button"
              onClick={() => set('displayMode', mode)}
              className={`flex flex-col items-center gap-0.5 rounded-md border p-2 text-xs transition ${config.displayMode === mode ? 'border-primary bg-primary/10 text-primary' : 'border-input hover:border-primary/40'}`}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid / Masonry Settings ── */}
      {showGrid && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Sütun</label>
            <select value={config.columns} onChange={(e) => set('columns', e.target.value as ImageGalleryV1Config['columns'])} className={inputCls}>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          {config.displayMode === 'grid' && (
            <div>
              <label className="mb-1 block text-sm font-medium">Oran</label>
              <select value={config.aspectRatio} onChange={(e) => set('aspectRatio', e.target.value as ImageGalleryV1Config['aspectRatio'])} className={inputCls}>
                <option value="square">Kare</option>
                <option value="4:3">4:3</option>
                <option value="3:4">3:4</option>
                <option value="16:9">16:9</option>
                <option value="auto">Oto</option>
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Boşluk</label>
            <select value={config.gap} onChange={(e) => set('gap', e.target.value as ImageGalleryV1Config['gap'])} className={inputCls}>
              <option value="none">Yok</option>
              <option value="sm">Küçük</option>
              <option value="md">Orta</option>
              <option value="lg">Büyük</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Köşe</label>
            <select value={config.borderRadius} onChange={(e) => set('borderRadius', e.target.value as ImageGalleryV1Config['borderRadius'])} className={inputCls}>
              <option value="none">Yok</option>
              <option value="sm">Küçük</option>
              <option value="md">Orta</option>
              <option value="lg">Büyük</option>
              <option value="xl">XL</option>
              <option value="full">Tam</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Slider Settings ── */}
      {showSlider && (
        <div className="space-y-3 rounded-md border border-input p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Slayt Ayarları</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Geçiş</label>
              <select value={config.transition} onChange={(e) => set('transition', e.target.value as ImageGalleryV1Config['transition'])} className={inputCls}>
                <option value="slide">Kayma</option>
                <option value="fade">Solma</option>
                <option value="zoom">Zoom</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Görünür Slayt</label>
              <select value={config.slidesPerView} onChange={(e) => set('slidesPerView', e.target.value as ImageGalleryV1Config['slidesPerView'])} className={inputCls}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Oto-oynat (sn)</label>
              <input type="number" min={0} max={30} value={config.autoPlay} onChange={(e) => set('autoPlay', parseInt(e.target.value) || 0)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Hız (ms)</label>
              <input type="number" min={200} max={2000} step={100} value={config.transitionSpeed} onChange={(e) => set('transitionSpeed', parseInt(e.target.value) || 500)} className={inputCls} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={config.showArrows} onChange={(e) => set('showArrows', e.target.checked)} className="rounded" /><span className="text-sm">Oklar</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={config.showDots} onChange={(e) => set('showDots', e.target.checked)} className="rounded" /><span className="text-sm">Noktalar</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={config.loop} onChange={(e) => set('loop', e.target.checked)} className="rounded" /><span className="text-sm">Döngü</span></label>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Köşe</label>
            <select value={config.borderRadius} onChange={(e) => set('borderRadius', e.target.value as ImageGalleryV1Config['borderRadius'])} className={inputCls}>
              <option value="none">Yok</option>
              <option value="sm">Küçük</option>
              <option value="md">Orta</option>
              <option value="lg">Büyük</option>
              <option value="xl">XL</option>
              <option value="full">Tam</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Booklet Settings ── */}
      {showBooklet && (
        <div className="space-y-3 rounded-md border border-input p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Kitapçık Ayarları</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Oto-oynat (sn)</label>
              <input type="number" min={0} max={30} value={config.autoPlay} onChange={(e) => set('autoPlay', parseInt(e.target.value) || 0)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Hız (ms)</label>
              <input type="number" min={200} max={2000} step={100} value={config.transitionSpeed} onChange={(e) => set('transitionSpeed', parseInt(e.target.value) || 500)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Köşe</label>
            <select value={config.borderRadius} onChange={(e) => set('borderRadius', e.target.value as ImageGalleryV1Config['borderRadius'])} className={inputCls}>
              <option value="none">Yok</option>
              <option value="sm">Küçük</option>
              <option value="md">Orta</option>
              <option value="lg">Büyük</option>
              <option value="xl">XL</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Marquee Settings ── */}
      {showMarquee && (
        <div className="space-y-3 rounded-md border border-input p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Kayan Bant Ayarları</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Hız (px/sn)</label>
              <input type="number" min={10} max={200} value={config.marqueeSpeed} onChange={(e) => set('marqueeSpeed', parseInt(e.target.value) || 50)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Yükseklik (px)</label>
              <input type="number" min={60} max={500} value={config.marqueeHeight} onChange={(e) => set('marqueeHeight', parseInt(e.target.value) || 200)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Yön</label>
              <select value={config.marqueeDirection} onChange={(e) => set('marqueeDirection', e.target.value as 'left' | 'right')} className={inputCls}>
                <option value="left">Sola</option>
                <option value="right">Sağa</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Köşe</label>
              <select value={config.borderRadius} onChange={(e) => set('borderRadius', e.target.value as ImageGalleryV1Config['borderRadius'])} className={inputCls}>
                <option value="none">Yok</option>
                <option value="sm">Küçük</option>
                <option value="md">Orta</option>
                <option value="lg">Büyük</option>
                <option value="xl">XL</option>
                <option value="full">Tam</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={config.marqueePauseOnHover} onChange={(e) => set('marqueePauseOnHover', e.target.checked)} className="rounded" />
            <span className="text-sm">Üzerine gelince duraklat</span>
          </label>
        </div>
      )}

      {/* ── Hover Effect ── */}
      <div>
        <label className="mb-1 block text-sm font-medium">Hover Efekti</label>
        <select value={config.hoverEffect} onChange={(e) => set('hoverEffect', e.target.value as ImageGalleryV1Config['hoverEffect'])} className={inputCls}>
          <option value="none">Yok</option>
          <option value="zoom">Zoom</option>
          <option value="fade">Solma</option>
          <option value="slideUp">Yukarı Kayma</option>
          <option value="rotate">Döndürme</option>
          <option value="blurReveal">Bulanık → Netleş</option>
          <option value="tilt">Eğim (3D)</option>
          <option value="shine">Parıltı</option>
        </select>
      </div>

      {/* ── Captions ── */}
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showCaptions} onChange={(e) => set('showCaptions', e.target.checked)} className="rounded" />
          <span className="text-sm font-medium">Alt yazıları göster</span>
        </label>
        {config.showCaptions && (
          <select value={config.captionPosition} onChange={(e) => set('captionPosition', e.target.value as ImageGalleryV1Config['captionPosition'])} className={inputCls}>
            <option value="bottom">Alt kısım (hover)</option>
            <option value="center">Ortada (hover)</option>
            <option value="overlay">Overlay (her zaman)</option>
          </select>
        )}
      </div>

      {/* ── Lightbox ── */}
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={config.lightbox} onChange={(e) => set('lightbox', e.target.checked)} className="rounded" />
        <span className="text-sm">Lightbox aktif</span>
      </label>

      {/* ── Background ── */}
      <GalleryBackgroundPicker
        value={(config.background || { type: 'none' }) as import('../../shared/background-picker').BackgroundConfig}
        onChange={(bg) => onChange({ ...config, background: bg as ImageGalleryV1Config['background'] })}
      />

      {/* ── Images ── */}
      <div className="border-t pt-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold">Görseller ({config.images.length})</label>
          <button onClick={addImage} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90" type="button">+ Görsel Ekle</button>
        </div>
        <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
          {config.images.map((image, index) => (
            <div key={index} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Görsel {index + 1}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveImage(index, 'up')} disabled={index === 0} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" title="Yukarı">↑</button>
                  <button type="button" onClick={() => moveImage(index, 'down')} disabled={index === config.images.length - 1} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" title="Aşağı">↓</button>
                  <button onClick={() => removeImage(index)} className="rounded p-1 text-destructive hover:bg-destructive/10" type="button" aria-label="Görseli sil">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <GalleryImageUpload value={image.src} onChange={(url) => updateImage(index, { src: url })} />
              <input type="text" value={image.alt} onChange={(e) => updateImage(index, { alt: e.target.value })} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm" placeholder="Alt metin / açıklama" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Helper wrapper components (dynamic imports)
// =====================================================

function GalleryImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const { ImageUploadField } = require('../../shared/image-upload-field') as { ImageUploadField: typeof import('../../shared/image-upload-field').ImageUploadField };
  return (
    <ImageUploadField
      value={value !== '/placeholder.jpg' && !value.startsWith('/placeholder-') ? value : undefined}
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
