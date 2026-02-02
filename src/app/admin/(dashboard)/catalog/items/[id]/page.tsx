/**
 * Edit Item Page
 * Edit an existing product/service
 */

'use client';

import { useState, useEffect } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

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
        .single();

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
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ürün Düzenle</h1>
          <p className="text-sm text-muted-foreground">
            Ürün bilgilerini güncelleyin
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-md border border-destructive px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          {isDeleting ? 'Siliniyor...' : 'Sil'}
        </button>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Ürün Adı
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium">
            URL Slug
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/urun/</span>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium">
            Kategori
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Kategori Seçin</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium">
            Fiyat (₺)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="mb-1 block text-sm font-medium">
            Görsel URL
          </label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="https://..."
          />
          {imageUrl ? (
            <div className="relative mt-2 h-32 w-32 rounded overflow-hidden">
              <Image
                src={imageUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Açıklama
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="isActive" className="text-sm">
              Aktif (sitede görünsün)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="isFeatured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="isFeatured" className="text-sm">
              Öne çıkan ürün
            </label>
          </div>
        </div>

        {error ? (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => router.push('/admin/catalog/items')}
            className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
