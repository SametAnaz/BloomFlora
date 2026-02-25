/**
 * New Item Page
 * Create a new product/service
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
type ItemInsert = Database['public']['Tables']['items']['Insert'];

export default function NewItemPage() {
  const router = useRouter();
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
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      setCategories((data || []) as unknown as CategoryRow[]);
    };
    loadCategories();
  }, []);

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
      setError('Ürün adı gerekli');
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
        .from('items')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existing) {
        setError('Bu URL zaten kullanılıyor');
        setIsCreating(false);
        return;
      }

      // Create item
      const insertData: ItemInsert = {
        name,
        slug,
        description: description || null,
        price: price ? Number(price) : null,
        image_url: imageUrl || null,
        category_id: categoryId || null,
        is_active: isActive,
        is_featured: isFeatured,
      };

      console.log('[items/new] Inserting:', JSON.stringify(insertData));

      const { data: insertedData, error: createError } = await supabase
        .from('items')
        .insert(insertData as never)
        .select();

      console.log('[items/new] Result:', { insertedData, createError });

      if (createError) {
        const msg = createError.message || createError.details || JSON.stringify(createError);
        setError(`Hata: ${msg}`);
        setIsCreating(false);
        return;
      }

      router.push('/admin/catalog/items');
      router.refresh();
    } catch (err: unknown) {
      const e = err as { message?: string; details?: string; code?: string };
      console.error('Create error:', JSON.stringify(err), e.message, e.details, e.code);
      setError(`Ürün oluşturulurken hata: ${e.message || JSON.stringify(err)}`);
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      {/* Header */}
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
          <h1 className="text-2xl font-bold">Yeni Ürün / Hizmet</h1>
          <p className="text-sm text-muted-foreground">Yeni bir ürün veya hizmet ekleyin</p>
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
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Örn: Kırmızı Gül Buketi"
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
                    placeholder="kirmizi-gul-buketi"
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
                    Ürün Ekle
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
