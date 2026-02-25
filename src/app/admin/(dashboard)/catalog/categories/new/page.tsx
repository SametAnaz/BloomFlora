/**
 * New Category Page
 * Create a new product/service category
 */

'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { ImageField } from '@/components/admin/image-field';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

// Force dynamic rendering (uses cookies for Supabase)
export const dynamic = 'force-dynamic';

type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    const generatedSlug = value
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setSlug(generatedSlug);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Kategori adı gerekli');
      return;
    }
    if (!slug.trim()) {
      setError('URL slug gerekli');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check if slug exists
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existing) {
        setError('Bu URL zaten kullanılıyor');
        setIsCreating(false);
        return;
      }

      // Get max order
      const { data: maxOrderData } = await supabase
        .from('categories')
        .select('order')
        .order('order', { ascending: false })
        .limit(1)
        .single() as { data: { order: number } | null; error: unknown };

      const nextOrder = (maxOrderData?.order ?? 0) + 1;

      // Create category
      const insertData: CategoryInsert = {
        name,
        slug,
        description: description || null,
        image_url: imageUrl || null,
        is_active: isActive,
        order: nextOrder,
      };

      const { error: createError } = await supabase
        .from('categories')
        .insert(insertData as never);

      if (createError) throw createError;

      router.push('/admin/catalog/categories');
      router.refresh();
    } catch (err) {
      console.error('Create error:', err);
      setError('Kategori oluşturulurken hata oluştu');
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin/catalog/categories')}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Geri dön"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">Yeni Kategori</h1>
          <p className="text-sm text-muted-foreground">
            Yeni bir ürün/hizmet kategorisi oluşturun
          </p>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info Card */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Temel Bilgiler</h2>
            </div>
            <div className="space-y-5 p-6">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                  Kategori Adı
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Örn: Çiçek Buketleri"
                />
              </div>

              <div>
                <label htmlFor="slug" className="mb-1.5 block text-sm font-medium">
                  URL Slug
                </label>
                <div className="flex items-center overflow-hidden rounded-lg border border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <span className="border-r bg-muted px-3 py-2.5 text-sm text-muted-foreground">/kategori/</span>
                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 bg-background px-3 py-2.5 text-sm focus:outline-none"
                    placeholder="cicek-buketleri"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Bu kategori hakkında kısa bir açıklama yazın..."
                />
              </div>
            </div>
          </div>

          {/* Image Card */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Görsel</h2>
            </div>
            <div className="p-6">
              <ImageField
                label=""
                value={imageUrl}
                onChange={setImageUrl}
                placeholder="Kategori görseli seçin veya yükleyin"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Durum</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Görünürlük</p>
                  <p className="text-xs text-muted-foreground">Sitede gösterilsin mi?</p>
                </div>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 hover:bg-emerald-500/25'
                      : 'bg-muted text-muted-foreground border border-border hover:bg-accent'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'
                  }`} />
                  {isActive ? 'Aktif' : 'Pasif'}
                </button>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="p-6 space-y-3">
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {isCreating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Kategori Oluştur
                  </>
                )}
              </button>
              <button
                onClick={() => router.push('/admin/catalog/categories')}
                className="w-full rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
