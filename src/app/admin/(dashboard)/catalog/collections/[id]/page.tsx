/**
 * Edit Collection Page
 * Edit an existing collection
 */

'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type CollectionRow = Database['public']['Tables']['collections']['Row'];
type CollectionUpdate = Database['public']['Tables']['collections']['Update'];
type ItemRow = Database['public']['Tables']['items']['Row'];

interface EditCollectionPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCollectionPage({ params }: EditCollectionPageProps) {
  const router = useRouter();

  const [collection, setCollection] = useState<CollectionRow | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [order, setOrder] = useState(0);

  const [items, setItems] = useState<ItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params;
      const supabase = createClient();

      const collectionRes = await supabase.from('collections').select('*').eq('id', id).single() as unknown as { data: CollectionRow | null; error: unknown };
      const itemsRes = await supabase.from('items').select('*').order('name', { ascending: true }) as unknown as { data: ItemRow[] | null; error: unknown };

      if (collectionRes.error || !collectionRes.data) {
        router.push('/admin/catalog/collections');
        return;
      }

      const loadedCollection = collectionRes.data;
      setCollection(loadedCollection);
      setName(loadedCollection.name);
      setSlug(loadedCollection.slug);
      setDescription(loadedCollection.description || '');
      setIsActive(loadedCollection.is_active);
      setSelectedItemIds(loadedCollection.item_ids || []);
      setOrder(loadedCollection.order);

      setItems(itemsRes.data || []);
      setIsLoading(false);
    };

    loadData();
  }, [params, router]);

  const toggleItem = (itemId: string) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!collection) return;

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

      const updateData: CollectionUpdate = {
        name,
        slug,
        description: description || null,
        is_active: isActive,
        item_ids: selectedItemIds,
        order,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('collections')
        .update(updateData as never)
        .eq('id', collection.id);

      if (updateError) throw updateError;

      router.push('/admin/catalog/collections');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!collection) return;
    // eslint-disable-next-line no-alert
    if (!window.confirm('Bu koleksiyonu silmek istediğinizden emin misiniz?')) return;

    setIsDeleting(true);

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from('collections')
        .delete()
        .eq('id', collection.id);

      if (deleteError) throw deleteError;

      router.push('/admin/catalog/collections');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme işlemi başarısız');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!collection) {
    return null;
  }

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
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Koleksiyonu Düzenle</h1>
          <p className="text-muted-foreground">{collection.name}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center justify-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          {isDeleting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
              Siliniyor...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Sil
            </>
          )}
        </button>
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
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
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
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="order" className="mb-1 block text-sm font-medium">
              Sıra
            </label>
            <input
              type="number"
              id="order"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm font-medium">Aktif</span>
            </label>
          </div>
        </div>

        {/* Items Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Ürünler ({selectedItemIds.length} seçili)
          </label>
          {items.length > 0 ? (
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
              Henüz ürün yok.
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
              'Değişiklikleri Kaydet'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
