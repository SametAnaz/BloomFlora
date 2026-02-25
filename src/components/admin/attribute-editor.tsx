'use client';

import { useState } from 'react';

import type { ItemAttribute } from '@/lib/supabase/types';

/* ── Helpers ────────────────────────────────────────────────────── */

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

const ATTR_TYPE_LABELS: Record<ItemAttribute['type'], string> = {
  dropdown: 'Açılır Liste',
  text: 'Metin',
  number: 'Sayı',
  toggle: 'Açma/Kapama',
};

/* ── Component ──────────────────────────────────────────────────── */

interface AttributeEditorProps {
  value: ItemAttribute[];
  onChange: (attrs: ItemAttribute[]) => void;
}

export function AttributeEditor({ value, onChange }: AttributeEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ── Add new attribute ── */
  const addAttribute = () => {
    const attr: ItemAttribute = {
      id: uid(),
      name: '',
      type: 'dropdown',
      options: [''],
      required: false,
    };
    onChange([...value, attr]);
    setEditingId(attr.id);
  };

  /* ── Remove attribute ── */
  const removeAttribute = (id: string) => {
    onChange(value.filter((a) => a.id !== id));
    if (editingId === id) setEditingId(null);
  };

  /* ── Update single attribute field ── */
  const updateAttr = (id: string, patch: Partial<ItemAttribute>) => {
    onChange(
      value.map((a) => {
        if (a.id !== id) return a;
        const updated = { ...a, ...patch };
        // Switch to dropdown → ensure options exist
        if (patch.type === 'dropdown' && (!updated.options || updated.options.length === 0)) {
          updated.options = [''];
        }
        // Switch away from dropdown → remove options
        if (patch.type && patch.type !== 'dropdown') {
          delete updated.options;
        }
        // Switch away from toggle → remove placeholder
        if (patch.type && patch.type !== 'toggle') {
          delete updated.placeholder;
        }
        return updated;
      })
    );
  };

  /* ── Dropdown options management ── */
  const addOption = (attrId: string) => {
    onChange(
      value.map((a) =>
        a.id === attrId ? { ...a, options: [...(a.options || []), ''] } : a
      )
    );
  };

  const updateOption = (attrId: string, idx: number, val: string) => {
    onChange(
      value.map((a) => {
        if (a.id !== attrId) return a;
        const opts = [...(a.options || [])];
        opts[idx] = val;
        return { ...a, options: opts };
      })
    );
  };

  const removeOption = (attrId: string, idx: number) => {
    onChange(
      value.map((a) => {
        if (a.id !== attrId) return a;
        const opts = (a.options || []).filter((_, i) => i !== idx);
        return { ...a, options: opts };
      })
    );
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Ürün Özellikleri
        </h2>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {value.length}
        </span>
      </div>

      <div className="p-6 space-y-4">
        {value.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            Henüz özellik eklenmedi
          </p>
        )}

        {value.map((attr) => {
          const isEditing = editingId === attr.id;

          return (
            <div
              key={attr.id}
              className={`rounded-lg border transition-colors ${
                isEditing ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'
              }`}
            >
              {/* Attribute header */}
              <div className="flex items-center gap-2 px-4 py-3">
                {/* Drag handle placeholder */}
                <svg className="h-4 w-4 shrink-0 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>

                <div className="flex flex-1 items-center gap-2 min-w-0">
                  <span className="truncate text-sm font-medium">
                    {attr.name || <span className="italic text-muted-foreground">İsimsiz</span>}
                  </span>
                  <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {ATTR_TYPE_LABELS[attr.type]}
                  </span>
                  {attr.required && (
                    <span className="shrink-0 rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-500">
                      Zorunlu
                    </span>
                  )}
                </div>

                {/* Toggle expand */}
                <button
                  type="button"
                  onClick={() => setEditingId(isEditing ? null : attr.id)}
                  className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  title="Düzenle"
                >
                  <svg className={`h-4 w-4 transition-transform ${isEditing ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeAttribute(attr.id)}
                  className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Kaldır"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Expanded editor */}
              {isEditing && (
                <div className="border-t px-4 py-4 space-y-4">
                  {/* Name + Type */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Özellik Adı</label>
                      <input
                        type="text"
                        value={attr.name}
                        onChange={(e) => updateAttr(attr.id, { name: e.target.value })}
                        placeholder="Örn: Renk, Boyut..."
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Giriş Tipi</label>
                      <select
                        value={attr.type}
                        onChange={(e) => updateAttr(attr.id, { type: e.target.value as ItemAttribute['type'] })}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="dropdown">Açılır Liste (Dropdown)</option>
                        <option value="text">Metin Kutusu (Text)</option>
                        <option value="number">Sayı / Adet (Number)</option>
                        <option value="toggle">Açma / Kapama (Toggle)</option>
                      </select>
                    </div>
                  </div>

                  {/* Required toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Zorunlu Alan</p>
                      <p className="text-xs text-muted-foreground">Müşteri bu özelliği doldurmak zorunda mı?</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateAttr(attr.id, { required: !attr.required })}
                      className={`inline-flex min-w-[5.5rem] items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-all duration-200 shrink-0 ${
                        attr.required
                          ? 'bg-red-500/15 text-red-500 border border-red-500/25 hover:bg-red-500/25'
                          : 'bg-muted text-muted-foreground border border-border hover:bg-accent'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${attr.required ? 'bg-red-500' : 'bg-muted-foreground/50'}`} />
                      {attr.required ? 'Evet' : 'Hayır'}
                    </button>
                  </div>

                  {/* Dropdown options */}
                  {attr.type === 'dropdown' && (
                    <div>
                      <label className="mb-2 block text-xs font-medium text-muted-foreground">Seçenekler</label>
                      <div className="space-y-2">
                        {(attr.options || []).map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(attr.id, idx, e.target.value)}
                              placeholder={`Seçenek ${idx + 1}`}
                              className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(attr.id, idx)}
                              disabled={(attr.options || []).length <= 1}
                              className="shrink-0 rounded p-1 text-muted-foreground hover:text-red-500 disabled:opacity-30 transition-colors"
                              title="Seçeneği Kaldır"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(attr.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Seçenek Ekle
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Toggle placeholder */}
                  {attr.type === 'toggle' && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Metin Alanı İpucu (Opsiyonel)</label>
                      <input
                        type="text"
                        value={attr.placeholder || ''}
                        onChange={(e) => updateAttr(attr.id, { placeholder: e.target.value })}
                        placeholder="Örn: Etikete yazılacak isim..."
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">Müşteri bu özelliği açtığında gösterilecek metin alanının ipucusu. Boş bırakılırsa sadece aç/kapa butonu gösterilir.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add attribute button */}
        <button
          type="button"
          onClick={addAttribute}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Özellik Ekle
        </button>
      </div>
    </div>
  );
}
