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

const PAGE_SIZE = 12;

export default function ItemsPage() {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pagedItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const [itemsRes, categoriesRes] = await Promise.all([
      supabase.from('items').select('*').order('order', { ascending: true }),
      supabase.from('categories').select('*').order('name', { ascending: true }),
    ]);
    setItems((itemsRes.data || []) as unknown as ItemRow[]);
    setCategories((categoriesRes.data || []) as unknown as CategoryRow[]);
    setCurrentPage(1);
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Ürün
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {items.length > 0 ? (
            <span>
              Toplam <strong className="text-foreground">{items.length}</strong> ürün
              {totalPages > 1 && (
                <span> — sayfa {currentPage}/{totalPages}</span>
              )}
              <span className="mx-2">·</span>
              Aktif: <strong className="text-emerald-500">{items.filter((i) => i.is_active).length}</strong>
              <span className="mx-2">·</span>
              Öne çıkan: <strong className="text-amber-500">{items.filter((i) => i.is_featured).length}</strong>
            </span>
          ) : null}
        </div>
        {/* View mode toggle */}
        <div className="flex items-center rounded-lg border bg-muted p-1 gap-1">
          <button
            onClick={() => setViewMode('list')}
            title="Liste görünümü"
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            title="Döşeme görünümü"
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {actionError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="ml-2 font-bold text-lg leading-none">×</button>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="rounded-xl border bg-card py-16 text-center">
          <svg className="mx-auto h-12 w-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="mt-3 text-muted-foreground">Henüz ürün eklenmemiş</p>
          <Link href="/admin/catalog/items/new" className="mt-3 inline-block text-sm text-primary hover:underline">
            İlk ürününüzü ekleyin →
          </Link>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && items.length > 0 && (
        <div className="rounded-xl border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="w-16 px-3 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Sıra</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Ürün</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Fiyat</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Öne Çıkan</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pagedItems.map((item, pageIndex) => {
                const globalIndex = (currentPage - 1) * PAGE_SIZE + pageIndex;
                return (
                  <tr key={item.id} className="hover:bg-accent/50 group">
                    {/* Reorder */}
                    <td className="px-3 py-4">
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          onClick={() => handleReorder(globalIndex, 'up')}
                          disabled={globalIndex === 0}
                          className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                          title="Yukarı taşı"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <span className="text-xs text-muted-foreground">{globalIndex + 1}</span>
                        <button
                          onClick={() => handleReorder(globalIndex, 'down')}
                          disabled={globalIndex === items.length - 1}
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
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border">
                            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted">
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
                      {item.category_id ? categoryMap.get(item.category_id) || '-' : <span className="text-muted-foreground">-</span>}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-sm">
                      {item.price ? `${item.price} ₺` : '-'}
                    </td>

                    {/* Featured */}
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleToggleFeatured(item)} title={item.is_featured ? 'Öne çıkandan kaldır' : 'Öne çıkan yap'}>
                        {item.is_featured ? (
                          <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-muted-foreground hover:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        )}
                      </button>
                    </td>

                    {/* Status */}
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
                        <span className={`h-1.5 w-1.5 rounded-full ${item.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'}`} />
                        {item.is_active ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/catalog/items/${item.id}`} className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground" title="Düzenle">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button onClick={() => handleDelete(item)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Sil">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pagedItems.map((item) => (
            <div key={item.id} className="group flex flex-col rounded-xl border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="relative aspect-[4/3] bg-muted">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <svg className="h-10 w-10 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Featured badge overlay */}
                {item.is_featured && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Öne Çıkan
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <p className="font-semibold leading-tight">{item.name}</p>
                {item.category_id && categoryMap.get(item.category_id) && (
                  <p className="text-xs text-muted-foreground">{categoryMap.get(item.category_id)}</p>
                )}
                {item.price && (
                  <p className="text-sm font-medium text-primary">{item.price} ₺</p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t px-4 py-3">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                    item.is_active
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 hover:bg-emerald-500/25'
                      : 'bg-muted text-muted-foreground border border-border hover:bg-accent'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${item.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'}`} />
                  {item.is_active ? 'Aktif' : 'Pasif'}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFeatured(item)}
                    title={item.is_featured ? 'Öne çıkandan kaldır' : 'Öne çıkan yap'}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-amber-500 transition-colors"
                  >
                    {item.is_featured ? (
                      <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                  </button>
                  <Link
                    href={`/admin/catalog/items/${item.id}`}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    title="Düzenle"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDelete(item)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Sil"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Önceki sayfa"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const isNear = Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
            if (!isNear) {
              const prevNear = Math.abs((page - 1) - currentPage) <= 2 || (page - 1) === 1 || (page - 1) === totalPages;
              if (!prevNear) return null;
              return <span key={`ellipsis-${page}`} className="px-1 text-muted-foreground">…</span>;
            }
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card hover:bg-accent'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Sonraki sayfa"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
