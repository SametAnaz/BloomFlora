/**
 * Items List Page
 * Admin page to manage products/services with reorder, delete, image preview
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type ItemRow = Database['public']['Tables']['items']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

export default function ItemsPage() {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const [itemsRes, categoriesRes] = await Promise.all([
      supabase.from('items').select('*').order('order', { ascending: true }),
      supabase.from('categories').select('*').order('name', { ascending: true }),
    ]);
    setItems((itemsRes.data || []) as unknown as ItemRow[]);
    setCategories((categoriesRes.data || []) as unknown as CategoryRow[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (item: ItemRow) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`"${item.name}" ürünü silmek istediğinizden emin misiniz?`)) return;

    setActionError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('items').delete().eq('id', item.id);
      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      setActionError('Ürün silinirken hata oluştu');
    }
  };

  const handleToggleActive = async (item: ItemRow) => {
    setActionError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('items')
        .update({ is_active: !item.is_active, updated_at: new Date().toISOString() } as never)
        .eq('id', item.id);
      if (error) throw error;
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i))
      );
    } catch {
      setActionError('Durum güncellenirken hata oluştu');
    }
  };

  const handleToggleFeatured = async (item: ItemRow) => {
    setActionError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('items')
        .update({ is_featured: !item.is_featured, updated_at: new Date().toISOString() } as never)
        .eq('id', item.id);
      if (error) throw error;
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_featured: !i.is_featured } : i))
      );
    } catch {
      setActionError('Durum güncellenirken hata oluştu');
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    setActionError(null);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...items];
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];

    // Update local state immediately
    setItems(newItems);

    // Persist order to DB
    try {
      const supabase = createClient();
      const updates = newItems.map((item, i) =>
        supabase
          .from('items')
          .update({ order: i, updated_at: new Date().toISOString() } as never)
          .eq('id', item.id)
      );
      await Promise.all(updates);
    } catch {
      setActionError('Sıralama güncellenirken hata oluştu');
      loadData(); // Reload on error
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ürünler / Hizmetler</h1>
          <p className="text-sm text-muted-foreground">
            Ürünleri ekleyin, düzenleyin, sıralayın ve silin
          </p>
        </div>
        <Link
          href="/admin/catalog/items/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Ürün
        </Link>
      </div>

      {/* Error Banner */}
      {actionError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* Items Table */}
      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="w-16 px-3 py-3 text-center text-xs font-medium uppercase text-muted-foreground">
                Sıra
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                Ürün
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                Kategori
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                Fiyat
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase text-muted-foreground">
                Öne Çıkan
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase text-muted-foreground">
                Durum
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={item.id} className="hover:bg-accent/50 group">
                  {/* Reorder */}
                  <td className="px-3 py-4">
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        onClick={() => handleReorder(index, 'up')}
                        disabled={index === 0}
                        className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Yukarı taşı"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <span className="text-xs text-muted-foreground">{index + 1}</span>
                      <button
                        onClick={() => handleReorder(index, 'down')}
                        disabled={index === items.length - 1}
                        className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Aşağı taşı"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </td>

                  {/* Product */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
                          <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">/{item.slug}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 text-sm">
                    {item.category_id ? (
                      categoryMap.get(item.category_id) || '-'
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 text-sm">
                    {item.price ? `${item.price} ₺` : '-'}
                  </td>

                  {/* Featured toggle */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleFeatured(item)}
                      className="group/star"
                      title={item.is_featured ? 'Öne çıkandan kaldır' : 'Öne çıkan yap'}
                    >
                      {item.is_featured ? (
                        <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-muted-foreground hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      )}
                    </button>
                  </td>

                  {/* Status toggle */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                        item.is_active
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 hover:bg-emerald-500/25'
                          : 'bg-muted text-muted-foreground border border-border hover:bg-accent'
                      }`}
                      title={item.is_active ? 'Pasife al' : 'Aktif yap'}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        item.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'
                      }`} />
                      {item.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/catalog/items/${item.id}`}
                        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Düzenle"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(item)}
                        className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Sil"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p>Henüz ürün eklenmemiş</p>
                    <Link
                      href="/admin/catalog/items/new"
                      className="mt-2 text-sm text-primary hover:underline"
                    >
                      İlk ürününüzü ekleyin →
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Toplam: {items.length} ürün</span>
          <span>•</span>
          <span>Aktif: {items.filter((i) => i.is_active).length}</span>
          <span>•</span>
          <span>Öne çıkan: {items.filter((i) => i.is_featured).length}</span>
        </div>
      )}
    </div>
  );
}
