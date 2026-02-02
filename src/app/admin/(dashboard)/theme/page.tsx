/**
 * Theme Editor Page
 * Edit site theme colors with live preview
 */

'use client';

import { useState, useEffect } from 'react';

import { ColorPicker } from '@/components/admin/color-picker';

import { createClient } from '@/lib/supabase/client';
import {
  defaultThemeTokens,
  type ThemeColors,
  type ThemeTokens,
} from '@/lib/theme/tokens';

interface ThemeRow {
  id: string;
  name: string;
  tokens: ThemeTokens;
  is_active: boolean;
}

// Color groups for better organization
const colorGroups = [
  {
    name: 'Ana Renkler',
    colors: [
      { key: 'primary', label: 'Birincil' },
      { key: 'primaryForeground', label: 'Birincil Metin' },
      { key: 'secondary', label: 'İkincil' },
      { key: 'secondaryForeground', label: 'İkincil Metin' },
    ] as const,
  },
  {
    name: 'Arka Plan',
    colors: [
      { key: 'background', label: 'Arka Plan' },
      { key: 'foreground', label: 'Metin' },
      { key: 'card', label: 'Kart' },
      { key: 'cardForeground', label: 'Kart Metni' },
    ] as const,
  },
  {
    name: 'Vurgu & Durum',
    colors: [
      { key: 'accent', label: 'Vurgu' },
      { key: 'accentForeground', label: 'Vurgu Metni' },
      { key: 'muted', label: 'Soluk' },
      { key: 'mutedForeground', label: 'Soluk Metin' },
      { key: 'destructive', label: 'Tehlike' },
    ] as const,
  },
  {
    name: 'Kenarlıklar & Girdiler',
    colors: [
      { key: 'border', label: 'Kenarlık' },
      { key: 'input', label: 'Girdi' },
      { key: 'ring', label: 'Odak Halkası' },
    ] as const,
  },
];

export default function ThemeEditorPage() {
  const [theme, setTheme] = useState<ThemeRow | null>(null);
  const [colors, setColors] = useState<ThemeColors>(defaultThemeTokens.colors);
  const [radius, setRadius] = useState(defaultThemeTokens.radius);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load active theme
  useEffect(() => {
    const loadTheme = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from('theme')
        .select('*')
        .eq('is_active', true)
        .single();

      if (data) {
        const themeData = data as unknown as ThemeRow;
        setTheme(themeData);
        if (themeData.tokens?.colors) {
          setColors({ ...defaultThemeTokens.colors, ...themeData.tokens.colors });
        }
        if (themeData.tokens?.radius) {
          setRadius(themeData.tokens.radius);
        }
      }

      setIsLoading(false);
    };

    loadTheme();
  }, []);

  // Apply colors to preview
  useEffect(() => {
    // Apply to :root for live preview
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });
    root.style.setProperty('--radius', radius);
  }, [colors, radius]);

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const supabase = createClient();

      const newTokens: ThemeTokens = {
        colors,
        radius,
        shadow: defaultThemeTokens.shadow,
      };

      if (theme) {
        // Update existing theme
        const { error: updateError } = await supabase
          .from('theme')
          .update({
            tokens: newTokens,
            updated_at: new Date().toISOString(),
          } as never)
          .eq('id', theme.id);

        if (updateError) throw updateError;
      } else {
        // Create new theme
        const { error: insertError } = await supabase
          .from('theme')
          .insert({
            name: 'Varsayılan Tema',
            tokens: newTokens,
            is_active: true,
          } as never);

        if (insertError) throw insertError;
      }

      setSuccessMessage('Tema başarıyla kaydedildi!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydetme başarısız');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setColors(defaultThemeTokens.colors);
    setRadius(defaultThemeTokens.radius);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      {/* Editor Panel */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tema Editörü</h1>
            <p className="text-muted-foreground">
              Site renklerini ve stilini özelleştirin
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Sıfırla
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        {error ? (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
            {successMessage}
          </div>
        ) : null}

        {/* Color Groups */}
        {colorGroups.map((group) => (
          <div key={group.name} className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 font-semibold">{group.name}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.colors.map(({ key, label }) => (
                <ColorPicker
                  key={key}
                  label={label}
                  value={colors[key]}
                  onChange={(value) => handleColorChange(key, value)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Radius */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 font-semibold">Köşe Yuvarlaklığı</h2>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.125"
              value={parseFloat(radius)}
              onChange={(e) => setRadius(`${e.target.value}rem`)}
              className="flex-1"
            />
            <span className="w-16 text-sm font-mono">{radius}</span>
          </div>
          <div className="mt-4 flex gap-2">
            {['0rem', '0.25rem', '0.5rem', '0.75rem', '1rem'].map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`h-8 w-8 border transition-colors ${
                  radius === r ? 'border-primary bg-primary/10' : 'border-input hover:border-primary/50'
                }`}
                style={{ borderRadius: r }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 font-semibold">Canlı Önizleme</h2>

          {/* Preview Components */}
          <div className="space-y-4">
            {/* Buttons */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Butonlar</p>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  Birincil
                </button>
                <button className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
                  İkincil
                </button>
                <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
                  Kenarlık
                </button>
                <button className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white">
                  Tehlike
                </button>
              </div>
            </div>

            {/* Card */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Kart</p>
              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <h3 className="font-semibold text-card-foreground">Kart Başlığı</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bu bir örnek kart içeriğidir.
                </p>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Girdiler</p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Metin girdisi"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-input" />
                  <label className="text-sm">Onay kutusu</label>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Rozetler</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Birincil
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  İkincil
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  Soluk
                </span>
              </div>
            </div>

            {/* Colors */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Renk Paleti</p>
              <div className="grid grid-cols-5 gap-1">
                <div className="aspect-square rounded bg-primary" title="Primary" />
                <div className="aspect-square rounded bg-secondary" title="Secondary" />
                <div className="aspect-square rounded bg-accent" title="Accent" />
                <div className="aspect-square rounded bg-muted" title="Muted" />
                <div className="aspect-square rounded bg-destructive" title="Destructive" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
