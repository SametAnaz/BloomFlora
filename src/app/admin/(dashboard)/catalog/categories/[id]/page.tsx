/**
 * Edit Category Page
 * Edit an existing category
 */

'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { ImageField } from '@/components/admin/image-field';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

// Force dynamic rendering (uses cookies for Supabase)
export const dynamic = 'force-dynamic';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategory = async () => {
      const { id } = await params;
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.push('/admin/catalog/categories');
        return;
      }

      const cat = data as unknown as CategoryRow;
      setCategory(cat);
      setName(cat.name);
      setSlug(cat.slug);
      setDescription(cat.description || '');
      setIsActive(cat.is_active);
      setOrder(cat.order);
      setImageUrl(cat.image_url || '');
      setIsLoading(false);
    };

    loadCategory();
  }, [params, router]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Kategori adı gerekli');
      return;
    }
    if (!slug.trim()) {
      setError('URL slug gerekli');
      return;
    }
    if (!category) return;

    setIsSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check if slug exists (excluding current)
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', category.id)
        .maybeSingle();

      if (existing) {
        setError('Bu URL başka bir kategori tarafından kullanılıyor');
        setIsSaving(false);
        return;
      }

      const updateData = {
        name,
        slug,
        description: description || null,
        image_url: imageUrl || null,
        is_active: isActive,
        order,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('categories')
        .update(updateData as never)
        .eq('id', category.id);

      if (updateError) throw updateError;

      router.push('/admin/catalog/categories');
      router.refresh();
    } catch (err) {
      console.error('Update error:', err);
      setError('Kategori güncellenirken hata oluştu');
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    // eslint-disable-next-line no-alert
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    setIsDeleting(true);

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (deleteError) throw deleteError;

      router.push('/admin/catalog/categories');
      router.refresh();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Kategori silinirken hata oluştu');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-2xl font-bold">Kategori Düzenle</h1>
            <p className="text-sm text-muted-foreground">
              {name || 'Kategori'} bilgilerini güncelleyin
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {isDeleting ? 'Siliniyor...' : 'Sil'}
        </button>
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
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Örn: Çiçekler"
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
            <div className="space-y-5 p-6">
              {/* Active Toggle */}
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

              {/* Order */}
              <div>
                <label htmlFor="order" className="mb-1.5 block text-sm font-medium">
                  Sıralama
                </label>
                <input
                  id="order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-xs text-muted-foreground">Küçük sayılar önce gösterilir</p>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="p-6 space-y-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Değişiklikleri Kaydet
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
