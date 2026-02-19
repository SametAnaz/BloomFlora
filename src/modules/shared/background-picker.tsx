/**
 * Shared Background Picker Component
 * Professional background editor for all module blocks.
 * Supports: none / solid color / gradient / image backgrounds.
 *
 * MUST NOT use 'use client' — modules are loaded server-side via registerModule().
 * This file is always rendered inside a 'use client' boundary (BlockEditor).
 */

import * as React from 'react';

import type { z } from 'zod';

import type { backgroundConfigSchema } from '../types';

// ── Types ──────────────────────────────────────────────
export type BackgroundConfig = z.infer<typeof backgroundConfigSchema>;

export interface BackgroundPickerProps {
  value: BackgroundConfig;
  onChange: (value: BackgroundConfig) => void;
  /** Storage folder for uploaded images (default: 'backgrounds') */
  imageFolder?: string;
  /** Show overlay opacity slider (default: true) */
  showOverlay?: boolean;
  /** Whether to render the outer border-t / pt-4 wrapper (default: true) */
  withSection?: boolean;
}

// ── Preset Colors ──────────────────────────────────────
const colorGroups = [
  {
    label: 'Marka & Koyu',
    colors: ['#4D1D2A', '#6B2D3D', '#8B3A4A', '#2D1B2E', '#1a1a2e', '#16213e', '#0f3460', '#1B1B1B'],
  },
  {
    label: 'Sıcak Tonlar',
    colors: ['#ef4444', '#f97316', '#f59e0b', '#dc2626', '#b91c1c', '#9a3412', '#c2410c', '#ea580c'],
  },
  {
    label: 'Doğa & Yeşil',
    colors: ['#22c55e', '#16a34a', '#15803d', '#166534', '#4ade80', '#86efac', '#059669', '#10b981'],
  },
  {
    label: 'Soğuk Tonlar',
    colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#0ea5e9', '#06b6d4', '#2563eb', '#7c3aed'],
  },
  {
    label: 'Pembe & Çiçek',
    colors: ['#ec4899', '#d946ef', '#f43f5e', '#fb7185', '#f472b6', '#e879f9', '#c084fc', '#fda4af'],
  },
  {
    label: 'Nötr',
    colors: ['#ffffff', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#404040', '#171717'],
  },
];

// ── Preset Gradients ───────────────────────────────────
const gradientPresets = [
  { label: 'Gül', css: 'linear-gradient(135deg, #4D1D2A 0%, #8B3A4A 100%)' },
  { label: 'Şafak', css: 'linear-gradient(135deg, #f43f5e 0%, #f97316 100%)' },
  { label: 'Gece', css: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' },
  { label: 'Orman', css: 'linear-gradient(135deg, #166534 0%, #059669 100%)' },
  { label: 'Okyanus', css: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' },
  { label: 'Lav', css: 'linear-gradient(135deg, #dc2626 0%, #7c3aed 100%)' },
  { label: 'Altın', css: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
  { label: 'Buzul', css: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)' },
  { label: 'Gün Batımı', css: 'linear-gradient(135deg, #fda4af 0%, #f59e0b 100%)' },
  { label: 'Yosun', css: 'linear-gradient(135deg, #4ade80 0%, #2dd4bf 100%)' },
  { label: 'Cam', css: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' },
  { label: 'Karanlık', css: 'linear-gradient(180deg, #171717 0%, #404040 100%)' },
];

// ── Background Style Helper ────────────────────────────
export function getBackgroundStyle(bg?: BackgroundConfig): React.CSSProperties {
  if (!bg || bg.type === 'none') return {};
  if (bg.type === 'color') return { backgroundColor: bg.color || undefined };
  if (bg.type === 'gradient') return { backgroundImage: bg.gradient || undefined };
  if (bg.type === 'image' && bg.image?.src) {
    return { backgroundImage: `url(${bg.image.src})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  return {};
}

/** Returns true if background needs an overlay div */
export function needsOverlay(bg?: BackgroundConfig): boolean {
  return !!bg && bg.type !== 'none' && (bg.overlayOpacity ?? 0) > 0;
}

// ── Tab Button ─────────────────────────────────────────
function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────
export function BackgroundPicker({
  value,
  onChange,
  imageFolder = 'backgrounds',
  showOverlay = true,
  withSection = true,
}: BackgroundPickerProps) {
  const [customGradient, setCustomGradient] = React.useState(false);
  const [hexInput, setHexInput] = React.useState(value.color || '');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [showMediaPicker, setShowMediaPicker] = React.useState(false);

  // keep hex input in sync
  React.useEffect(() => {
    if (value.color) setHexInput(value.color);
  }, [value.color]);

  const set = (patch: Partial<BackgroundConfig>) => onChange({ ...value, ...patch });

  const handleColorSelect = (color: string) => {
    setHexInput(color);
    set({ type: 'color', color });
  };

  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    if (/^#[0-9A-Fa-f]{3,8}$/.test(hex)) {
      set({ type: 'color', color: hex });
    }
  };

  const handleGradientSelect = (css: string) => {
    set({ type: 'gradient', gradient: css });
    setCustomGradient(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { uploadFile } = await import('@/lib/media');
      const result = await uploadFile(file, imageFolder);
      if (result.success && result.file) {
        set({ type: 'image', image: { src: result.file.url, alt: '' } });
      }
    } catch { /* silent */ }
    setUploading(false);
    e.target.value = '';
  };

  const wrapper = withSection ? 'border-t pt-4' : '';

  return (
    <div className={wrapper}>
      {withSection && (
        <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Arkaplan
        </label>
      )}

      {/* ── Type Tabs ─── */}
      <div className="mb-3 flex gap-1 rounded-lg bg-muted/50 p-1">
        <Tab active={value.type === 'none'} onClick={() => set({ type: 'none' })}>Yok</Tab>
        <Tab active={value.type === 'color'} onClick={() => set({ type: 'color' })}>Renk</Tab>
        <Tab active={value.type === 'gradient'} onClick={() => set({ type: 'gradient' })}>Gradyan</Tab>
        <Tab active={value.type === 'image'} onClick={() => set({ type: 'image' })}>Görsel</Tab>
      </div>

      {/* ── NONE ─── */}
      {value.type === 'none' && (
        <p className="py-3 text-center text-xs text-muted-foreground">Arkaplan yok — sayfa arka planı kullanılacak.</p>
      )}

      {/* ── COLOR ─── */}
      {value.type === 'color' && (
        <div className="space-y-3">
          {/* Preview + inputs */}
          <div className="flex items-center gap-3">
            <div
              className="h-11 w-11 shrink-0 rounded-lg border-2 border-input shadow-inner"
              style={{ backgroundColor: value.color || '#ffffff' }}
            />
            <input
              type="color"
              value={value.color || '#ffffff'}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-input p-0.5"
            />
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              className="h-11 flex-1 rounded-md border border-input bg-background px-3 font-mono text-sm uppercase"
              placeholder="#4D1D2A"
            />
          </div>

          {/* Color swatches */}
          {colorGroups.map((group) => (
            <div key={group.label}>
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {group.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleColorSelect(c)}
                    className={`h-7 w-7 rounded-md border-2 transition-all hover:scale-110 ${
                      value.color === c ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* CSS variable presets */}
          <div>
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tema Renkleri
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Primary', val: 'var(--primary)' },
                { label: 'Secondary', val: 'var(--secondary)' },
                { label: 'Accent', val: 'var(--accent)' },
                { label: 'Muted', val: 'var(--muted)' },
                { label: 'Card', val: 'var(--card)' },
                { label: 'Background', val: 'var(--background)' },
              ].map((t) => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => { set({ type: 'color', color: t.val }); setHexInput(t.val); }}
                  className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-colors ${
                    value.color === t.val ? 'border-primary bg-primary/10 text-primary' : 'border-input text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── GRADIENT ─── */}
      {value.type === 'gradient' && (
        <div className="space-y-3">
          {/* Preview bar */}
          <div
            className="h-12 w-full rounded-lg border"
            style={{ backgroundImage: value.gradient || 'linear-gradient(135deg, #4D1D2A 0%, #8B3A4A 100%)' }}
          />

          {/* Preset grid */}
          <div className="grid grid-cols-4 gap-2">
            {gradientPresets.map((g) => (
              <button
                key={g.label}
                type="button"
                onClick={() => handleGradientSelect(g.css)}
                className={`group relative overflow-hidden rounded-lg border-2 transition-all hover:scale-105 ${
                  value.gradient === g.css ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
                }`}
              >
                <div className="h-10" style={{ backgroundImage: g.css }} />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-[9px] font-bold text-white opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                  {g.label}
                </span>
              </button>
            ))}
          </div>

          {/* Custom / Edit toggle */}
          <div>
            <button
              type="button"
              onClick={() => setCustomGradient(!customGradient)}
              className="mb-1 text-xs text-primary hover:underline"
            >
              {customGradient ? 'Hazır gradyan seç ↑' : 'Özel gradyan CSS yaz →'}
            </button>
            {customGradient && (
              <textarea
                value={value.gradient || ''}
                onChange={(e) => set({ gradient: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
                rows={2}
                placeholder="linear-gradient(135deg, #4D1D2A 0%, #6B2D3D 100%)"
              />
            )}
          </div>
        </div>
      )}

      {/* ── IMAGE ─── */}
      {value.type === 'image' && (
        <div className="space-y-3">
          {/* Preview */}
          {value.image?.src && (
            <div className="relative overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value.image.src} alt="" className="h-32 w-full object-cover" />
              {/* overlay preview */}
              {(value.overlayOpacity ?? 0) > 0 && (
                <div className="absolute inset-0 bg-black" style={{ opacity: (value.overlayOpacity ?? 0) / 100 }} />
              )}
              <button
                type="button"
                onClick={() => set({ image: undefined })}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Upload / Gallery buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 rounded-md border border-dashed border-input px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Yükleniyor...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Resim Yükle
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowMediaPicker(true)}
              className="flex-1 rounded-md border border-input px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Galeriden Seç
              </span>
            </button>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

          {/* URL paste */}
          <div>
            <label className="mb-0.5 block text-xs text-muted-foreground">veya URL yapıştır</label>
            <input
              type="text"
              value={value.image?.src || ''}
              onChange={(e) => set({ image: e.target.value ? { src: e.target.value, alt: '' } : undefined })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>

          {/* Media Picker Modal */}
          {showMediaPicker && (
            <BgMediaPickerModal
              value={value.image?.src}
              onSelect={(url) => {
                if (url) set({ type: 'image', image: { src: url, alt: '' } });
                setShowMediaPicker(false);
              }}
              onClose={() => setShowMediaPicker(false)}
            />
          )}
        </div>
      )}

      {/* ── Overlay slider ─── */}
      {showOverlay && value.type !== 'none' && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Overlay Opaklığı</label>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
              {value.overlayOpacity ?? 0}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={value.overlayOpacity ?? 0}
            onChange={(e) => set({ overlayOpacity: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}

// ── Lazy MediaPicker Modal ─────────────────────────────
function BgMediaPickerModal({
  value,
  onSelect,
  onClose,
}: {
  value?: string;
  onSelect: (url: string | null) => void;
  onClose: () => void;
}) {
  const [Comp, setComp] = React.useState<React.ComponentType<{
    value?: string;
    onChange: (url: string | null) => void;
    onClose?: () => void;
  }> | null>(null);

  React.useEffect(() => {
    import('@/components/admin/media-picker').then((mod) => setComp(() => mod.MediaPicker));
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        {Comp ? (
          <Comp value={value} onChange={onSelect} onClose={onClose} />
        ) : (
          <div className="flex h-[500px] items-center justify-center rounded-lg bg-card">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
