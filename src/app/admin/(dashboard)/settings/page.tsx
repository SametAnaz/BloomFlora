/**
 * Site Settings Page
 * Manage site-wide settings: site name, WhatsApp, contact info, SEO defaults, etc.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';

interface SettingsMap {
  site_name: string;
  site_description: string;
  whatsapp_number: string;
  whatsapp_message: string;
  whatsapp_enabled: boolean;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  social_instagram: string;
  social_facebook: string;
  social_twitter: string;
  seo_title: string;
  seo_description: string;
  seo_og_image: string;
}

const DEFAULT_SETTINGS: SettingsMap = {
  site_name: 'BloomFlora',
  site_description: '',
  whatsapp_number: '',
  whatsapp_message: 'Merhaba, bilgi almak istiyorum.',
  whatsapp_enabled: true,
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  social_instagram: '',
  social_facebook: '',
  social_twitter: '',
  seo_title: '',
  seo_description: '',
  seo_og_image: '',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from('site_settings')
      .select('key, value');

    if (fetchError) {
      console.error('Settings fetch error:', fetchError);
      setIsLoading(false);
      return;
    }

    const rows = (data || []) as unknown as { key: string; value: unknown }[];
    const loaded = { ...DEFAULT_SETTINGS };

    for (const row of rows) {
      const key = row.key as keyof SettingsMap;
      if (key in loaded) {
        (loaded as Record<string, unknown>)[key] = row.value;
      }
    }

    setSettings(loaded);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();

      // Upsert each setting
      const entries = Object.entries(settings) as [keyof SettingsMap, unknown][];
      const upserts = entries.map(([key, value]) =>
        supabase
          .from('site_settings')
          .upsert(
            { key, value: value as never, updated_at: new Date().toISOString() } as never,
            { onConflict: 'key' }
          )
      );

      const results = await Promise.all(upserts);
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        throw new Error((failed.error as { message?: string }).message || 'Kaydetme hatası');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Ayarlar kaydedilirken hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const update = <K extends keyof SettingsMap>(key: K, value: SettingsMap[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Site Ayarları</h1>
          <p className="text-sm text-muted-foreground">
            Genel site ayarlarını buradan yönetin
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* Success / Error */}
      {success && (
        <div className="rounded-md bg-green-100 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Ayarlar başarıyla kaydedildi.
        </div>
      )}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Genel */}
      <Section title="Genel" description="Site adı ve açıklaması">
        <Field label="Site Adı">
          <input
            type="text"
            value={settings.site_name}
            onChange={(e) => update('site_name', e.target.value)}
            className="input-field"
            placeholder="BloomFlora"
          />
        </Field>
        <Field label="Site Açıklaması">
          <textarea
            value={settings.site_description}
            onChange={(e) => update('site_description', e.target.value)}
            rows={2}
            className="input-field"
            placeholder="Çiçekçi web sitesi"
          />
        </Field>
      </Section>

      {/* WhatsApp */}
      <Section title="WhatsApp" description="WhatsApp iletişim butonu ayarları">
        <div className="flex items-center gap-2">
          <input
            id="wa-enabled"
            type="checkbox"
            checked={settings.whatsapp_enabled}
            onChange={(e) => update('whatsapp_enabled', e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="wa-enabled" className="text-sm">
            WhatsApp butonunu göster
          </label>
        </div>
        <Field label="Telefon Numarası">
          <input
            type="text"
            value={settings.whatsapp_number}
            onChange={(e) => update('whatsapp_number', e.target.value)}
            className="input-field"
            placeholder="905551234567"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Ülke kodu ile, boşluk veya + olmadan
          </p>
        </Field>
        <Field label="Otomatik Mesaj">
          <input
            type="text"
            value={settings.whatsapp_message}
            onChange={(e) => update('whatsapp_message', e.target.value)}
            className="input-field"
            placeholder="Merhaba, bilgi almak istiyorum."
          />
        </Field>
      </Section>

      {/* İletişim */}
      <Section title="İletişim" description="İletişim bilgileri">
        <Field label="E-posta">
          <input
            type="email"
            value={settings.contact_email}
            onChange={(e) => update('contact_email', e.target.value)}
            className="input-field"
            placeholder="info@bloomflora.com"
          />
        </Field>
        <Field label="Telefon">
          <input
            type="text"
            value={settings.contact_phone}
            onChange={(e) => update('contact_phone', e.target.value)}
            className="input-field"
            placeholder="+90 555 123 4567"
          />
        </Field>
        <Field label="Adres">
          <textarea
            value={settings.contact_address}
            onChange={(e) => update('contact_address', e.target.value)}
            rows={2}
            className="input-field"
            placeholder="İstanbul, Türkiye"
          />
        </Field>
      </Section>

      {/* Sosyal Medya */}
      <Section title="Sosyal Medya" description="Sosyal medya linkleri">
        <Field label="Instagram">
          <input
            type="url"
            value={settings.social_instagram}
            onChange={(e) => update('social_instagram', e.target.value)}
            className="input-field"
            placeholder="https://instagram.com/bloomflora"
          />
        </Field>
        <Field label="Facebook">
          <input
            type="url"
            value={settings.social_facebook}
            onChange={(e) => update('social_facebook', e.target.value)}
            className="input-field"
            placeholder="https://facebook.com/bloomflora"
          />
        </Field>
        <Field label="Twitter / X">
          <input
            type="url"
            value={settings.social_twitter}
            onChange={(e) => update('social_twitter', e.target.value)}
            className="input-field"
            placeholder="https://x.com/bloomflora"
          />
        </Field>
      </Section>

      {/* SEO */}
      <Section title="SEO" description="Varsayılan arama motoru ayarları">
        <Field label="Varsayılan Başlık">
          <input
            type="text"
            value={settings.seo_title}
            onChange={(e) => update('seo_title', e.target.value)}
            className="input-field"
            placeholder="BloomFlora - Çiçekçi"
          />
        </Field>
        <Field label="Varsayılan Açıklama">
          <textarea
            value={settings.seo_description}
            onChange={(e) => update('seo_description', e.target.value)}
            rows={2}
            className="input-field"
            placeholder="En güzel çiçekler..."
          />
        </Field>
        <Field label="OG Image URL">
          <input
            type="url"
            value={settings.seo_og_image}
            onChange={(e) => update('seo_og_image', e.target.value)}
            className="input-field"
            placeholder="https://..."
          />
        </Field>
      </Section>

      {/* Bottom save */}
      <div className="flex justify-end border-t pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* Shared input styles */}
      <style>{`
        .input-field {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid hsl(var(--input));
          background: hsl(var(--background));
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        .input-field:focus {
          outline: none;
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 1px hsl(var(--primary));
        }
      `}</style>
    </div>
  );
}

/* ── Helper Components ── */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
