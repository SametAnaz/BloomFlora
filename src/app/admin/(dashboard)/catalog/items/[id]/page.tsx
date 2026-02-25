/**
 * Edit Item Page
 * Edit an existing product/service
 */

'use client';

import { useState, useEffect } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { ImageField } from '@/components/admin/image-field';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

// Force dynamic rendering (uses cookies for Supabase)
export const dynamic = 'force-dynamic';

type ItemRow = Database['public']['Tables']['items']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface EditItemPageProps {
  params: Promise<{ id: string }>;
}

export default function EditItemPage({ params }: EditItemPageProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemRow | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params;
      const supabase = createClient();

      const itemRes = await supabase.from('items').select('*').eq('id', id).single() as unknown as { data: ItemRow | null; error: unknown };
      const categoriesRes = await supabase.from('categories').select('*').order('name', { ascending: true }) as unknown as { data: CategoryRow[] | null; error: unknown };

      if (itemRes.error || !itemRes.data) {
        router.push('/admin/catalog/items');
        return;
      }

      const loadedItem = itemRes.data;
      setItem(loadedItem);
      setName(loadedItem.name);
      setSlug(loadedItem.slug);
      setDescription(loadedItem.description || '');
      setPrice(loadedItem.price?.toString() || '');
      setCategoryId(loadedItem.category_id || '');
      setIsActive(loadedItem.is_active);
      setIsFeatured(loadedItem.is_featured);
      setImageUrl(loadedItem.image_url || '');

      setCategories(categoriesRes.data || []);
      setIsLoading(false);
    };

    loadData();
  }, [params, router]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Ürün adı gerekli');
      return;
    }
    if (!slug.trim()) {
      setError('URL slug gerekli');
      return;
    }
    if (!item) return;

    setIsSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check if slug exists (excluding current)
      const { data: existing } = await supabase
        .from('items')
        .select('id')
        .eq('slug', slug)
        .neq('id', item.id)
        .maybeSingle();

      if (existing) {
        setError('Bu URL başka bir ürün tarafından kullanılıyor');
        setIsSaving(false);
        return;
      }

      const updateData = {
        name,
        slug,
        description: description || null,
        price: price ? Number(price) : null,
        category_id: categoryId || null,
        is_active: isActive,
        is_featured: isFeatured,
        image_url: imageUrl || null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('items')
        .update(updateData as never)
        .eq('id', item.id);

      if (updateError) throw updateError;

      router.push('/admin/catalog/items');
      router.refresh();
    } catch (err) {
      console.error('Update error:', err);
      setError('Ürün güncellenirken hata oluştu');
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    // eslint-disable-next-line no-alert
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    setIsDeleting(true);

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', item.id);

      if (deleteError) throw deleteError;

      router.push('/admin/catalog/items');
      router.refresh();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Ürün silinirken hata oluştu');
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
            onClick={() => router.push('/admin/catalog/items')}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Geri dön"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Ürün Düzenle</h1>
            <p className="text-sm text-muted-foreground">{name || 'Ürün'} bilgilerini güncelleyin</p>
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
          {/* Basic Info */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Temel Bilgiler</h2>
            </div>
            <div className="space-y-5 p-6">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Ürün Adı</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="slug" className="mb-1.5 block text-sm font-medium">URL Slug</label>
                <div className="flex items-center overflow-hidden rounded-lg border border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <span className="border-r bg-muted px-3 py-2.5 text-sm text-muted-foreground">/urun/</span>
                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 bg-background px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="mb-1.5 block text-sm font-medium">Kategori</label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="price" className="mb-1.5 block text-sm font-medium">Fiyat (₺)</label>
                  <div className="flex items-center overflow-hidden rounded-lg border border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                    <span className="border-r bg-muted px-3 py-2.5 text-sm text-muted-foreground">₺</span>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="flex-1 bg-background px-3 py-2.5 text-sm focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium">Açıklama</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Ürün hakkında kısa bir açıklama yazın..."
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Görsel</h2>
            </div>
            <div className="p-6">
              <ImageField
                label=""
                value={imageUrl}
                onChange={setImageUrl}
                placeholder="Ürün görseli seçin veya yükleyin"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Durum</h2>
            </div>
            <div className="space-y-4 p-6">
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

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Öne Çıkan</p>
                  <p className="text-xs text-muted-foreground">Vitrin ürünü mü?</p>
                </div>
                <button
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                    isFeatured
                      ? 'bg-amber-500/15 text-amber-500 border border-amber-500/25 hover:bg-amber-500/25'
                      : 'bg-muted text-muted-foreground border border-border hover:bg-accent'
                  }`}
                >
                  <span className="text-base leading-none">{isFeatured ? '★' : '☆'}</span>
                  {isFeatured ? 'Evet' : 'Hayır'}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="space-y-3 p-6">
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
                onClick={() => router.push('/admin/catalog/items')}
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
