/**
 * Admin Navigation Editor
 * Manage header navbar and footer links, layout, and columns.
 * Uses site_settings keys: nav_header, nav_footer
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';
import {
  type HeaderConfig,
  type FooterConfig,
  type NavLink,
  type FooterColumn,
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
} from '@/lib/navigation/types';

/* ── Helpers ─────────────────────────────────────────────────── */

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function sorted(links: NavLink[]) {
  return [...links].sort((a, b) => a.order - b.order);
}

/* ── Sub-components ───────────────────────────────────────────── */

function LinkRow({
  link,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  link: NavLink;
  onChange: (l: NavLink) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border ${!link.label.trim() ? 'border-red-300 bg-red-50' : 'border-sidebar-border bg-card'} p-2`}>
      {/* Reorder */}
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
          title="Yukarı"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
          title="Aşağı"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Label */}
      <input
        value={link.label}
        onChange={(e) => onChange({ ...link, label: e.target.value })}
        placeholder="Etiket"
        className="w-32 flex-shrink-0 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
      />

      {/* Href */}
      <input
        value={link.href}
        onChange={(e) => onChange({ ...link, href: e.target.value })}
        placeholder="/sayfa-linki"
        className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
      />

      {/* External */}
      <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
        <input
          type="checkbox"
          checked={link.openInNewTab ?? false}
          onChange={(e) => onChange({ ...link, openInNewTab: e.target.checked })}
          className="accent-primary"
        />
        Yeni sekme
      </label>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        title="Kaldır"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────── */

export default function NavigationPage() {
  const [header, setHeader] = useState<HeaderConfig>(DEFAULT_HEADER_CONFIG);
  const [footer, setFooter] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Load ─────────────────────────────────────────────── */

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['nav_header', 'nav_footer']);

    if (err) {
      console.error(err);
      setIsLoading(false);
      return;
    }

    const rows = (data || []) as unknown as { key: string; value: unknown }[];
    for (const row of rows) {
      if (row.key === 'nav_header' && row.value && typeof row.value === 'object') {
        setHeader(row.value as HeaderConfig);
      }
      if (row.key === 'nav_footer' && row.value && typeof row.value === 'object') {
        setFooter(row.value as FooterConfig);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Save ─────────────────────────────────────────────── */

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      const now = new Date().toISOString();

      const [r1, r2] = await Promise.all([
        supabase
          .from('site_settings')
          .upsert({ key: 'nav_header', value: header as never, updated_at: now } as never, { onConflict: 'key' }),
        supabase
          .from('site_settings')
          .upsert({ key: 'nav_footer', value: footer as never, updated_at: now } as never, { onConflict: 'key' }),
      ]);

      if (r1.error || r2.error) {
        setError(r1.error?.message || r2.error?.message || 'Kayıt hatası');
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError('Beklenmeyen hata');
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Header helpers ─────────────────────────────────── */

  const addHeaderLink = () => {
    const maxOrder = header.links.reduce((m, l) => Math.max(m, l.order), -1);
    setHeader({
      ...header,
      links: [...header.links, { id: uid(), label: 'Yeni Bağlantı', href: '/', order: maxOrder + 1 }],
    });
  };

  const updateHeaderLink = (id: string, updated: NavLink) => {
    setHeader({ ...header, links: header.links.map((l) => (l.id === id ? updated : l)) });
  };

  const removeHeaderLink = (id: string) => {
    setHeader({ ...header, links: header.links.filter((l) => l.id !== id) });
  };

  const moveHeaderLink = (id: string, dir: -1 | 1) => {
    const list = sorted(header.links);
    const idx = list.findIndex((l) => l.id === id);
    if (idx < 0) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const order1 = list[idx].order;
    const order2 = list[swapIdx].order;
    setHeader({
      ...header,
      links: header.links.map((l) => {
        if (l.id === list[idx].id) return { ...l, order: order2 };
        if (l.id === list[swapIdx].id) return { ...l, order: order1 };
        return l;
      }),
    });
  };

  /* ── Footer helpers ─────────────────────────────────── */

  const addFooterColumn = () => {
    setFooter({
      ...footer,
      columns: [...footer.columns, { id: uid(), title: 'Yeni Sütun', links: [] }],
    });
  };

  const removeFooterColumn = (colId: string) => {
    setFooter({ ...footer, columns: footer.columns.filter((c) => c.id !== colId) });
  };

  const updateFooterColumn = (colId: string, partial: Partial<FooterColumn>) => {
    setFooter({
      ...footer,
      columns: footer.columns.map((c) => (c.id === colId ? { ...c, ...partial } : c)),
    });
  };

  const addFooterLink = (colId: string) => {
    const col = footer.columns.find((c) => c.id === colId);
    if (!col) return;
    const maxOrder = col.links.reduce((m, l) => Math.max(m, l.order), -1);
    updateFooterColumn(colId, {
      links: [...col.links, { id: uid(), label: 'Yeni Bağlantı', href: '/', order: maxOrder + 1 }],
    });
  };

  const updateFooterLink = (colId: string, linkId: string, updated: NavLink) => {
    const col = footer.columns.find((c) => c.id === colId);
    if (!col) return;
    updateFooterColumn(colId, { links: col.links.map((l) => (l.id === linkId ? updated : l)) });
  };

  const removeFooterLink = (colId: string, linkId: string) => {
    const col = footer.columns.find((c) => c.id === colId);
    if (!col) return;
    updateFooterColumn(colId, { links: col.links.filter((l) => l.id !== linkId) });
  };

  const moveFooterLink = (colId: string, linkId: string, dir: -1 | 1) => {
    const col = footer.columns.find((c) => c.id === colId);
    if (!col) return;
    const list = sorted(col.links);
    const idx = list.findIndex((l) => l.id === linkId);
    if (idx < 0) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const order1 = list[idx].order;
    const order2 = list[swapIdx].order;
    updateFooterColumn(colId, {
      links: col.links.map((l) => {
        if (l.id === list[idx].id) return { ...l, order: order2 };
        if (l.id === list[swapIdx].id) return { ...l, order: order1 };
        return l;
      }),
    });
  };

  /* ── Render ─────────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Navigasyon</h1>
          <p className="mt-1 text-sm text-muted-foreground">Navbar ve footer bağlantılarını, düzen ve görünümü yönetin.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          Navigasyon ayarları kaydedildi.
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ═══════════════════ HEADER / NAVBAR ═══════════════════ */}
      <section className="rounded-xl border border-sidebar-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Navbar (Üst Menü)</h2>
          <button
            type="button"
            onClick={() => setHeader(DEFAULT_HEADER_CONFIG)}
            className="rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary"
          >
            Varsayılana Dön
          </button>
        </div>

        {/* Layout options */}
        <div className="mt-4 flex flex-wrap items-center gap-6">
          {/* Logo position */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">Logo Konumu:</label>
            <select
              value={header.logoPosition}
              onChange={(e) => setHeader({ ...header, logoPosition: e.target.value as 'left' | 'center' })}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value="left">Sol</option>
              <option value="center">Orta</option>
            </select>
          </div>

          {/* Sticky */}
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <input
              type="checkbox"
              checked={header.sticky}
              onChange={(e) => setHeader({ ...header, sticky: e.target.checked })}
              className="accent-primary"
            />
            Sabit (Sticky)
          </label>
        </div>

        {/* Links */}
        <div className="mt-5 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Bağlantılar</h3>
          {sorted(header.links).map((link, idx) => (
            <LinkRow
              key={link.id}
              link={link}
              onChange={(l) => updateHeaderLink(link.id, l)}
              onRemove={() => removeHeaderLink(link.id)}
              onMoveUp={() => moveHeaderLink(link.id, -1)}
              onMoveDown={() => moveHeaderLink(link.id, 1)}
              isFirst={idx === 0}
              isLast={idx === header.links.length - 1}
            />
          ))}
          <button
            type="button"
            onClick={addHeaderLink}
            className="flex items-center gap-1.5 rounded-lg border-2 border-dashed border-input px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Bağlantı Ekle
          </button>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <section className="rounded-xl border border-sidebar-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Footer (Alt Bilgi)</h2>
          <button
            type="button"
            onClick={() => setFooter(DEFAULT_FOOTER_CONFIG)}
            className="rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary"
          >
            Varsayılana Dön
          </button>
        </div>

        {/* Layout options */}
        <div className="mt-4 flex flex-wrap items-center gap-6">
          {/* Column count */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">Grid Sütun Sayısı:</label>
            <select
              value={footer.columnLayout}
              onChange={(e) => setFooter({ ...footer, columnLayout: Number(e.target.value) as 2 | 3 | 4 })}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>

          {/* Show brand */}
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <input
              type="checkbox"
              checked={footer.showBrand}
              onChange={(e) => setFooter({ ...footer, showBrand: e.target.checked })}
              className="accent-primary"
            />
            Marka Alanı
          </label>
        </div>

        {/* Brand text */}
        {footer.showBrand && (
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Marka Açıklaması</label>
            <textarea
              value={footer.brandText}
              onChange={(e) => setFooter({ ...footer, brandText: e.target.value })}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Markanızı tanımlayan kısa metin..."
            />
          </div>
        )}

        {/* Copyright text */}
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Telif Hakkı Metni <span className="text-muted-foreground/60">(boş = varsayılan)</span>
          </label>
          <input
            value={footer.copyrightText}
            onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="© 2026 BloomFlora. Tüm hakları saklıdır."
          />
        </div>

        {/* Columns */}
        <div className="mt-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Sütunlar</h3>

          {footer.columns.map((col) => (
            <div key={col.id} className="rounded-lg border border-sidebar-border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <input
                  value={col.title}
                  onChange={(e) => updateFooterColumn(col.id, { title: e.target.value })}
                  placeholder="Sütun Başlığı"
                  className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => removeFooterColumn(col.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Sütunu Kaldır"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Column links */}
              <div className="mt-3 space-y-2">
                {sorted(col.links).map((link, idx) => (
                  <LinkRow
                    key={link.id}
                    link={link}
                    onChange={(l) => updateFooterLink(col.id, link.id, l)}
                    onRemove={() => removeFooterLink(col.id, link.id)}
                    onMoveUp={() => moveFooterLink(col.id, link.id, -1)}
                    onMoveDown={() => moveFooterLink(col.id, link.id, 1)}
                    isFirst={idx === 0}
                    isLast={idx === col.links.length - 1}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => addFooterLink(col.id)}
                  className="flex items-center gap-1.5 rounded-lg border-2 border-dashed border-input px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Bağlantı Ekle
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addFooterColumn}
            className="flex items-center gap-1.5 rounded-lg border-2 border-dashed border-input px-4 py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Sütun Ekle
          </button>
        </div>
      </section>

      {/* Bottom save */}
      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
}
