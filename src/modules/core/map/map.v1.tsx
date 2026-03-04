/**
 * Map / Location Module v1
 * Google Maps embed integration with rich location info cards,
 * multiple markers, directions link, opening hours, and style options.
 */

import * as React from 'react';
import { z } from 'zod';

import {
  backgroundConfigSchema,
  spacingConfigSchema,
  type ModuleDefinition,
} from '../../types';

// =====================================================
// Config Schema
// =====================================================

const openingHourSchema = z.object({
  day: z.string(),
  hours: z.string(),
  closed: z.boolean().default(false),
});

const locationInfoSchema = z.object({
  /** Location / business name */
  name: z.string().optional(),
  /** Full address text */
  address: z.string().optional(),
  /** Phone number */
  phone: z.string().optional(),
  /** Email */
  email: z.string().optional(),
  /** Website URL */
  website: z.string().optional(),
  /** Opening hours */
  openingHours: z.array(openingHourSchema).optional(),
});

export const mapV1ConfigSchema = z.object({
  /** Section title */
  title: z.string().optional(),
  /** Section subtitle */
  subtitle: z.string().optional(),

  // ── Map embed ─────────────────────────────────────
  /** Google Maps embed URL (iframe src) */
  embedUrl: z.string().default(''),
  /** Fallback: plain address for link generation */
  address: z.string().optional(),

  // ── Appearance ────────────────────────────────────
  /** Map height in px */
  mapHeight: z.number().min(200).max(900).default(450),
  /** Map width mode */
  mapWidth: z.enum(['full', 'container']).default('container'),
  /** Border radius */
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('md'),
  /** Show border/shadow */
  mapStyle: z.enum(['flat', 'border', 'shadow', 'elevated']).default('shadow'),
  /** Grayscale filter (0-100) – CSS filter on iframe */
  grayscale: z.number().min(0).max(100).default(0),

  // ── Layout ────────────────────────────────────────
  /** Layout mode for map + info card */
  layout: z.enum(['mapOnly', 'mapLeft', 'mapRight', 'mapTop', 'mapBottom']).default('mapRight'),
  /** Info card position ratio (% of width given to the info card in side layouts) */
  infoWidth: z.enum(['30', '40', '50']).default('40'),

  // ── Info Card ─────────────────────────────────────
  /** Show info card */
  showInfoCard: z.boolean().default(true),
  /** Info card data */
  locationInfo: locationInfoSchema.default({}),
  /** Show directions button */
  showDirections: z.boolean().default(true),
  /** Directions button text */
  directionsText: z.string().default('Yol Tarifi Al'),
  /** Info card style */
  cardStyle: z.enum(['minimal', 'bordered', 'filled', 'glass']).default('filled'),

  // ── Multiple locations ────────────────────────────
  /** Extra locations (switches to tabs if > 0) */
  extraLocations: z.array(z.object({
    label: z.string(),
    embedUrl: z.string(),
    address: z.string().optional(),
    locationInfo: locationInfoSchema.optional(),
  })).default([]),

  /** Spacing */
  spacing: spacingConfigSchema.default({}),
  /** Background */
  background: backgroundConfigSchema.default({ type: 'none' }),
});

export type MapV1Config = z.infer<typeof mapV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const mapV1DefaultConfig: MapV1Config = {
  title: 'Bizi Ziyaret Edin',
  subtitle: 'Mağazamıza bekleriz',
  embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3009.1554456789!2d28.9783589!3d41.0082376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab9bd6570f4e1%3A0x97e6e1a14a10fd40!2sSultanahmet%20Meydan%C4%B1!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str',
  address: 'Sultanahmet Meydanı, Fatih, İstanbul',
  mapHeight: 450,
  mapWidth: 'container',
  borderRadius: 'md',
  mapStyle: 'shadow',
  grayscale: 0,
  layout: 'mapRight',
  infoWidth: '40',
  showInfoCard: true,
  locationInfo: {
    name: 'BloomFlora Mağaza',
    address: 'Sultanahmet Meydanı, Fatih, İstanbul 34122',
    phone: '+90 212 123 45 67',
    email: 'info@bloomflora.com',
    website: 'https://bloomflora.com',
    openingHours: [
      { day: 'Pazartesi - Cuma', hours: '09:00 - 18:00', closed: false },
      { day: 'Cumartesi', hours: '10:00 - 16:00', closed: false },
      { day: 'Pazar', hours: '', closed: true },
    ],
  },
  showDirections: true,
  directionsText: 'Yol Tarifi Al',
  cardStyle: 'filled',
  extraLocations: [],
  spacing: { paddingTop: 'lg', paddingBottom: 'lg' },
  background: { type: 'none' },
};

// =====================================================
// Module Metadata
// =====================================================

export const mapV1Meta = {
  id: 'map.v1',
  name: 'Konum / Harita',
  description: 'Google Maps embed – konum kartı, yol tarifi, çalışma saatleri',
  category: 'contact' as const,
  icon: 'MapPin',
  version: '1.0.0',
  tags: ['map', 'location', 'google', 'address', 'directions', 'contact'],
};

// =====================================================
// Utility maps
// =====================================================

const radiusCls: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
};

const mapStyleCls: Record<string, string> = {
  flat: '',
  border: 'border border-border',
  shadow: 'shadow-lg',
  elevated: 'shadow-xl ring-1 ring-black/5',
};

const cardStyleCls: Record<string, string> = {
  minimal: '',
  bordered: 'border border-border',
  filled: 'bg-muted/50',
  glass: 'bg-white/10 backdrop-blur-md border border-white/20',
};

// =====================================================
// Sub-components
// =====================================================

/** SVG icon helpers */
const icons = {
  mapPin: (
    <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  phone: (
    <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  email: (
    <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  globe: (
    <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  clock: (
    <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  navigate: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
};

/** Builds a Google Maps directions URL from an address string */
function directionsUrl(address?: string): string {
  if (!address) return 'https://maps.google.com';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

/** Info Card */
function InfoCard({
  config,
  address,
  locationInfo,
}: {
  config: MapV1Config;
  address?: string;
  locationInfo?: z.infer<typeof locationInfoSchema>;
}) {
  const info = locationInfo ?? config.locationInfo;
  const addr = address ?? config.address;

  return (
    <div className={`flex h-full flex-col justify-between gap-6 p-6 ${radiusCls[config.borderRadius]} ${cardStyleCls[config.cardStyle]}`}>
      {/* Business name */}
      {info?.name && (
        <div>
          <h3 className="text-xl font-bold">{info.name}</h3>
        </div>
      )}

      {/* Contact details */}
      <div className="space-y-3">
        {info?.address && (
          <div className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-primary">{icons.mapPin}</span>
            <span>{info.address}</span>
          </div>
        )}
        {info?.phone && (
          <div className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-primary">{icons.phone}</span>
            <a href={`tel:${info.phone.replace(/\s/g, '')}`} className="hover:underline">{info.phone}</a>
          </div>
        )}
        {info?.email && (
          <div className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-primary">{icons.email}</span>
            <a href={`mailto:${info.email}`} className="hover:underline">{info.email}</a>
          </div>
        )}
        {info?.website && (
          <div className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-primary">{icons.globe}</span>
            <a href={info.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {info.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>

      {/* Opening hours */}
      {info?.openingHours && info.openingHours.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <span className="text-primary">{icons.clock}</span>
            Çalışma Saatleri
          </div>
          <div className="space-y-1">
            {info.openingHours.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{h.day}</span>
                <span className={h.closed ? 'font-medium text-destructive' : ''}>
                  {h.closed ? 'Kapalı' : h.hours}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Directions button */}
      {config.showDirections && addr && (
        <a
          href={directionsUrl(addr)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {icons.navigate}
          {config.directionsText}
        </a>
      )}
    </div>
  );
}

/** Map iframe */
function MapEmbed({ config, embedUrl }: { config: MapV1Config; embedUrl?: string }) {
  const url = embedUrl ?? config.embedUrl;

  if (!url) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground ${radiusCls[config.borderRadius]} ${mapStyleCls[config.mapStyle]}`}
        style={{ height: config.mapHeight }}
      >
        <div className="text-center">
          <span className="text-4xl">🗺️</span>
          <p className="mt-2 text-sm">Google Maps embed URL&apos;i giriniz</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden ${radiusCls[config.borderRadius]} ${mapStyleCls[config.mapStyle]}`}
      style={{ filter: config.grayscale > 0 ? `grayscale(${config.grayscale}%)` : undefined }}
    >
      <iframe
        src={url}
        width="100%"
        height={config.mapHeight}
        style={{ border: 0, display: 'block' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Maps"
      />
    </div>
  );
}

// =====================================================
// Render Component
// =====================================================

function MapV1Render({
  block,
}: {
  block: { config: MapV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;
  const hasExtra = config.extraLocations.length > 0;
  const [activeTab, setActiveTab] = React.useState(0);

  // Current location data
  const currentEmbed = activeTab === 0
    ? config.embedUrl
    : config.extraLocations[activeTab - 1]?.embedUrl;
  const currentAddress = activeTab === 0
    ? config.address
    : config.extraLocations[activeTab - 1]?.address ?? config.address;
  const currentInfo = activeTab === 0
    ? config.locationInfo
    : config.extraLocations[activeTab - 1]?.locationInfo ?? config.locationInfo;
  const tabLabels = [
    config.locationInfo?.name ?? 'Ana Konum',
    ...config.extraLocations.map((l) => l.label),
  ];

  // Background
  const bgStyle = (() => {
    const { getBackgroundStyle } = require('../../shared/background-picker') as { getBackgroundStyle: typeof import('../../shared/background-picker').getBackgroundStyle };
    return getBackgroundStyle(config.background as import('../../shared/background-picker').BackgroundConfig);
  })();
  const bgOverlay = typeof config.background === 'object' && (config.background as import('../../shared/background-picker').BackgroundConfig).overlayOpacity;

  // Layout classes
  const isHorizontal = config.layout === 'mapLeft' || config.layout === 'mapRight';
  const infoWidthCls = config.infoWidth === '30' ? 'lg:w-[30%]' : config.infoWidth === '50' ? 'lg:w-1/2' : 'lg:w-[40%]';
  const mapWidthCls = config.infoWidth === '30' ? 'lg:w-[70%]' : config.infoWidth === '50' ? 'lg:w-1/2' : 'lg:w-[60%]';

  return (
    <section className="relative py-12 md:py-16" style={bgStyle}>
      {bgOverlay ? (
        <div className="absolute inset-0 bg-black" style={{ opacity: ((config.background as import('../../shared/background-picker').BackgroundConfig).overlayOpacity ?? 0) / 100 }} />
      ) : null}

      <div className={`relative z-10 ${config.mapWidth === 'full' ? 'px-0' : 'container-mobile'}`}>
        {/* Header */}
        {(config.title || config.subtitle) && (
          <div className={`mb-8 ${config.mapWidth === 'full' ? 'container-mobile' : ''}`}>
            {config.title && <h2 className="text-2xl font-bold md:text-3xl">{config.title}</h2>}
            {config.subtitle && <p className="mt-2 text-muted-foreground">{config.subtitle}</p>}
          </div>
        )}

        {/* Tabs (multi-location) */}
        {hasExtra && (
          <div className={`mb-4 flex gap-2 overflow-x-auto ${config.mapWidth === 'full' ? 'container-mobile' : ''}`}>
            {tabLabels.map((label, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  i === activeTab
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {config.layout === 'mapOnly' ? (
          <MapEmbed config={config} embedUrl={currentEmbed} />
        ) : isHorizontal ? (
          <div className={`flex flex-col gap-6 lg:flex-row ${config.layout === 'mapRight' ? '' : 'lg:flex-row-reverse'}`}>
            <div className={`w-full ${mapWidthCls}`}>
              <MapEmbed config={config} embedUrl={currentEmbed} />
            </div>
            {config.showInfoCard && (
              <div className={`w-full ${infoWidthCls}`}>
                <InfoCard config={config} address={currentAddress} locationInfo={currentInfo} />
              </div>
            )}
          </div>
        ) : (
          <div className={`flex flex-col gap-6 ${config.layout === 'mapBottom' ? 'flex-col-reverse' : ''}`}>
            <MapEmbed config={config} embedUrl={currentEmbed} />
            {config.showInfoCard && (
              <InfoCard config={config} address={currentAddress} locationInfo={currentInfo} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// =====================================================
// Editor Component
// =====================================================

function MapV1Editor({
  config,
  onChange,
}: {
  config: MapV1Config;
  onChange: (config: MapV1Config) => void;
  blockId: string;
}) {
  const set = <K extends keyof MapV1Config>(key: K, value: MapV1Config[K]) =>
    onChange({ ...config, [key]: value });

  const setInfo = (key: string, value: unknown) =>
    onChange({ ...config, locationInfo: { ...config.locationInfo, [key]: value } });

  const inputCls = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

  // ── Opening hours helpers ──
  const hours = config.locationInfo?.openingHours ?? [];
  const addHour = () => setInfo('openingHours', [...hours, { day: 'Yeni gün', hours: '09:00 - 18:00', closed: false }]);
  const removeHour = (i: number) => setInfo('openingHours', hours.filter((_, idx) => idx !== i));
  const updateHour = (i: number, updates: Record<string, unknown>) => {
    const copy = [...hours];
    copy[i] = { ...copy[i], ...updates };
    setInfo('openingHours', copy);
  };

  // ── Extra locations helpers ──
  const extras = config.extraLocations ?? [];
  const addExtra = () =>
    set('extraLocations', [...extras, { label: `Şube ${extras.length + 2}`, embedUrl: '', address: '' }]);
  const removeExtra = (i: number) =>
    set('extraLocations', extras.filter((_, idx) => idx !== i));
  const updateExtra = (i: number, updates: Record<string, unknown>) => {
    const copy = [...extras];
    copy[i] = { ...copy[i], ...updates } as typeof copy[number];
    set('extraLocations', copy);
  };

  return (
    <div className="space-y-4 p-4">
      {/* ── Title / Subtitle ── */}
      <div>
        <label className="mb-1 block text-sm font-medium">Başlık</label>
        <input type="text" value={config.title || ''} onChange={(e) => set('title', e.target.value)} className={inputCls} placeholder="Bölüm başlığı" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Alt Başlık</label>
        <input type="text" value={config.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} className={inputCls} placeholder="İsteğe bağlı" />
      </div>

      {/* ── Map Embed URL ── */}
      <div>
        <label className="mb-1 block text-sm font-medium">Google Maps Embed URL</label>
        <textarea
          value={config.embedUrl}
          onChange={(e) => {
            let val = e.target.value.trim();
            // If user pastes full iframe tag, extract src
            const match = val.match(/src=["']([^"']+)["']/);
            if (match) val = match[1];
            set('embedUrl', val);
          }}
          className={`${inputCls} min-h-[80px]`}
          placeholder="Google Maps → Paylaş → Haritayı yerleştir → iframe src URL'si veya tüm iframe kodu yapıştırın"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Google Maps&apos;te &quot;Paylaş → Haritayı yerleştir&quot; seçeneğinden iframe kodunu veya sadece src URL&apos;ini yapıştırabilirsiniz.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Adres (yol tarifi için)</label>
        <input type="text" value={config.address || ''} onChange={(e) => set('address', e.target.value)} className={inputCls} placeholder="Tam adres" />
      </div>

      {/* ── Layout ── */}
      <div>
        <label className="mb-1 block text-sm font-medium">Düzen</label>
        <div className="grid grid-cols-5 gap-1.5">
          {([
            ['mapOnly', 'Sadece Harita', '🗺️'],
            ['mapLeft', 'Harita Sol', '◧'],
            ['mapRight', 'Harita Sağ', '◨'],
            ['mapTop', 'Harita Üst', '⬒'],
            ['mapBottom', 'Harita Alt', '⬓'],
          ] as const).map(([mode, label, icon]) => (
            <button
              key={mode}
              type="button"
              onClick={() => set('layout', mode)}
              className={`flex flex-col items-center gap-0.5 rounded-md border p-2 text-xs transition ${
                config.layout === mode ? 'border-primary bg-primary/10 text-primary' : 'border-input hover:border-primary/40'
              }`}
            >
              <span className="text-base">{icon}</span>
              <span className="leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Map Appearance ── */}
      <div className="space-y-3 rounded-md border border-input p-3">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Harita Görünüm</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Yükseklik (px)</label>
            <input type="number" min={200} max={900} step={50} value={config.mapHeight} onChange={(e) => set('mapHeight', parseInt(e.target.value) || 450)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Genişlik</label>
            <select value={config.mapWidth} onChange={(e) => set('mapWidth', e.target.value as MapV1Config['mapWidth'])} className={inputCls}>
              <option value="container">Konteyner</option>
              <option value="full">Tam Genişlik</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Köşe</label>
            <select value={config.borderRadius} onChange={(e) => set('borderRadius', e.target.value as MapV1Config['borderRadius'])} className={inputCls}>
              <option value="none">Yok</option>
              <option value="sm">Küçük</option>
              <option value="md">Orta</option>
              <option value="lg">Büyük</option>
              <option value="xl">XL</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Stil</label>
            <select value={config.mapStyle} onChange={(e) => set('mapStyle', e.target.value as MapV1Config['mapStyle'])} className={inputCls}>
              <option value="flat">Düz</option>
              <option value="border">Kenarlık</option>
              <option value="shadow">Gölge</option>
              <option value="elevated">Yükseltilmiş</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Gri Tonlama: {config.grayscale}%</label>
          <input type="range" min={0} max={100} step={5} value={config.grayscale} onChange={(e) => set('grayscale', parseInt(e.target.value))} className="w-full" />
        </div>
      </div>

      {/* ── Info Card ── */}
      <div className="space-y-3 rounded-md border border-input p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Bilgi Kartı</p>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={config.showInfoCard} onChange={(e) => set('showInfoCard', e.target.checked)} className="rounded" />
            <span className="text-xs">Göster</span>
          </label>
        </div>

        {config.showInfoCard && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium">Kart Stili</label>
              <select value={config.cardStyle} onChange={(e) => set('cardStyle', e.target.value as MapV1Config['cardStyle'])} className={inputCls}>
                <option value="minimal">Minimal</option>
                <option value="bordered">Kenarlıklı</option>
                <option value="filled">Dolgulu</option>
                <option value="glass">Cam (Glass)</option>
              </select>
            </div>

            {config.layout !== 'mapOnly' && (config.layout === 'mapLeft' || config.layout === 'mapRight') && (
              <div>
                <label className="mb-1 block text-sm font-medium">Kart Genişliği</label>
                <select value={config.infoWidth} onChange={(e) => set('infoWidth', e.target.value as MapV1Config['infoWidth'])} className={inputCls}>
                  <option value="30">%30</option>
                  <option value="40">%40</option>
                  <option value="50">%50</option>
                </select>
              </div>
            )}

            {/* Location Info fields */}
            <div className="space-y-2 border-t pt-3">
              <div>
                <label className="mb-1 block text-sm font-medium">İşletme Adı</label>
                <input type="text" value={config.locationInfo?.name || ''} onChange={(e) => setInfo('name', e.target.value)} className={inputCls} placeholder="Mağaza / işletme adı" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Adres (kartda gösterilecek)</label>
                <input type="text" value={config.locationInfo?.address || ''} onChange={(e) => setInfo('address', e.target.value)} className={inputCls} placeholder="Tam adres" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Telefon</label>
                  <input type="text" value={config.locationInfo?.phone || ''} onChange={(e) => setInfo('phone', e.target.value)} className={inputCls} placeholder="+90 212 ..." />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">E-posta</label>
                  <input type="text" value={config.locationInfo?.email || ''} onChange={(e) => setInfo('email', e.target.value)} className={inputCls} placeholder="info@..." />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Web Sitesi</label>
                <input type="text" value={config.locationInfo?.website || ''} onChange={(e) => setInfo('website', e.target.value)} className={inputCls} placeholder="https://..." />
              </div>
            </div>

            {/* Opening Hours */}
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Çalışma Saatleri</label>
                <button type="button" onClick={addHour} className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">+ Ekle</button>
              </div>
              {hours.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={h.day}
                    onChange={(e) => updateHour(i, { day: e.target.value })}
                    className="w-1/3 rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                    placeholder="Gün"
                  />
                  <input
                    type="text"
                    value={h.hours}
                    onChange={(e) => updateHour(i, { hours: e.target.value })}
                    className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                    placeholder="09:00 - 18:00"
                    disabled={h.closed}
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={h.closed} onChange={(e) => updateHour(i, { closed: e.target.checked })} className="rounded" />
                    Kapalı
                  </label>
                  <button type="button" onClick={() => removeHour(i)} className="rounded p-1 text-destructive hover:bg-destructive/10" aria-label="Sil">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Directions */}
            <div className="flex items-center gap-3 border-t pt-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.showDirections} onChange={(e) => set('showDirections', e.target.checked)} className="rounded" />
                <span className="text-sm">Yol Tarifi Butonu</span>
              </label>
              {config.showDirections && (
                <input type="text" value={config.directionsText} onChange={(e) => set('directionsText', e.target.value)} className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs" placeholder="Buton metni" />
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Extra Locations ── */}
      <div className="space-y-3 rounded-md border border-input p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Ek Konumlar</p>
          <button type="button" onClick={addExtra} className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">+ Konum Ekle</button>
        </div>
        {extras.length === 0 && (
          <p className="text-xs text-muted-foreground">Birden fazla şubeniz varsa ek konum ekleyebilirsiniz. Sekmeli görünüm otomatik oluşturulur.</p>
        )}
        {extras.map((loc, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Konum {i + 2}</span>
              <button type="button" onClick={() => removeExtra(i)} className="rounded p-1 text-destructive hover:bg-destructive/10" aria-label="Sil">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <input type="text" value={loc.label} onChange={(e) => updateExtra(i, { label: e.target.value })} className={inputCls} placeholder="Sekme etiketi (ör: Kadıköy Şubesi)" />
            <textarea
              value={loc.embedUrl}
              onChange={(e) => {
                let val = e.target.value.trim();
                const match = val.match(/src=["']([^"']+)["']/);
                if (match) val = match[1];
                updateExtra(i, { embedUrl: val });
              }}
              className={`${inputCls} min-h-[60px]`}
              placeholder="Google Maps embed URL"
            />
            <input type="text" value={loc.address || ''} onChange={(e) => updateExtra(i, { address: e.target.value })} className={inputCls} placeholder="Adres" />
          </div>
        ))}
      </div>

      {/* ── Background ── */}
      <MapBackgroundPicker
        value={(config.background || { type: 'none' }) as import('../../shared/background-picker').BackgroundConfig}
        onChange={(bg) => onChange({ ...config, background: bg as MapV1Config['background'] })}
      />
    </div>
  );
}

// =====================================================
// Dynamic import wrappers
// =====================================================

function MapBackgroundPicker({ value, onChange }: { value: import('../../shared/background-picker').BackgroundConfig; onChange: (bg: import('../../shared/background-picker').BackgroundConfig) => void }) {
  const { BackgroundPicker } = require('../../shared/background-picker') as { BackgroundPicker: typeof import('../../shared/background-picker').BackgroundPicker };
  return <BackgroundPicker value={value} onChange={onChange} imageFolder="map" />;
}

// =====================================================
// Module Definition
// =====================================================

export const mapV1Module: ModuleDefinition<MapV1Config> = {
  meta: mapV1Meta,
  configSchema: mapV1ConfigSchema,
  defaultConfig: mapV1DefaultConfig,
  Render: MapV1Render,
  Editor: MapV1Editor,
};
