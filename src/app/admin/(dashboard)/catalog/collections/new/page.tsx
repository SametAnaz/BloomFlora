/**
 * New Collection Page
 * Create a new item collection
 */

'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type ItemRow = Database['public']['Tables']['items']['Row'];
type CollectionInsert = Database['public']['Tables']['collections']['Insert'];

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function NewCollectionPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const [items, setItems] = useState<ItemRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items
  useEffect(() => {
    const loadItems = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('items')
        .select('*')
        .order('name', { ascending: true }) as unknown as { data: ItemRow[] | null };

      setItems(data || []);
      setIsLoadingItems(false);
    };

    loadItems();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      setSlug(generateSlug(name));
    }
  }, [name, slugManuallyEdited]);

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(value);
  };

  const toggleItem = (itemId: string) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Koleksiyon adı zorunludur');
      return;
    }

    if (!slug.trim()) {
      setError('URL slug zorunludur');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get max order
      const { data: maxOrderData } = await supabase
        .from('collections')
        .select('order')
        .order('order', { ascending: false })
        .limit(1)
        .single() as { data: { order: number } | null; error: unknown };

      const nextOrder = (maxOrderData?.order ?? 0) + 1;

      // Create collection
      const insertData: CollectionInsert = {
        name,
        slug,
        description: description || null,
        is_active: isActive,
        item_ids: selectedItemIds,
        order: nextOrder,
      };

      const { error: createError } = await supabase
        .from('collections')
        .insert(insertData as never);

      if (createError) throw createError;

      router.push('/admin/catalog/collections');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 hover:bg-accent"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">Yeni Koleksiyon</h1>
          <p className="text-muted-foreground">
            Ürünlerden oluşan yeni bir koleksiyon oluşturun
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
        {error ? (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Koleksiyon Adı *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Örn: Yaz Koleksiyonu"
            required
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium">
            URL Slug *
          </label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="yaz-koleksiyonu"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            URL&apos;de kullanılacak benzersiz tanımlayıcı
          </p>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Açıklama
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Koleksiyon hakkında kısa bir açıklama..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            Aktif
          </label>
        </div>

        {/* Items Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Ürünler ({selectedItemIds.length} seçili)
          </label>
          {isLoadingItems ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : items.length > 0 ? (
            <div className="max-h-64 overflow-auto rounded-md border divide-y">
              {items.map((item) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-accent/50"
                >
                  <input
                    type="checkbox"
                    checked={selectedItemIds.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="flex-1 text-sm">{item.name}</span>
                  {item.price ? (
                    <span className="text-sm text-muted-foreground">
                      {item.price.toLocaleString('tr-TR')} ₺
                    </span>
                  ) : null}
                </label>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Henüz ürün yok. Önce ürün ekleyin.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Kaydediliyor...
              </>
            ) : (
              'Koleksiyon Oluştur'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
