/**
 * Catalog Overview Page
 * Links to categories, items and collections management
 */

import Image from 'next/image';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type ItemRow = Database['public']['Tables']['items']['Row'];
type CollectionRow = Database['public']['Tables']['collections']['Row'];

export default async function CatalogPage() {
  const supabase = await createClient();

  const [categoriesRes, itemsRes, collectionsRes] = await Promise.all([
    supabase.from('categories').select('*').order('order', { ascending: true }),
    supabase.from('items').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('collections').select('*').order('order', { ascending: true }),
  ]);

  const categories = (categoriesRes.data || []) as unknown as CategoryRow[];
  const recentItems = (itemsRes.data || []) as unknown as ItemRow[];
  const collections = (collectionsRes.data || []) as unknown as CollectionRow[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Katalog</h1>
        <p className="text-sm text-muted-foreground">
          Kategorileri, ürün/hizmetleri ve koleksiyonları yönetin
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/catalog/categories"
          className="group rounded-lg border bg-card p-6 transition-colors hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kategoriler</p>
              <p className="mt-1 text-3xl font-bold">{categories.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground group-hover:text-primary">
            Kategorileri yönet →
          </p>
        </Link>

        <Link
          href="/admin/catalog/items"
          className="group rounded-lg border bg-card p-6 transition-colors hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ürünler / Hizmetler</p>
              <p className="mt-1 text-3xl font-bold">{recentItems.length}+</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground group-hover:text-primary">
            Ürün/hizmetleri yönet →
          </p>
        </Link>

        <Link
          href="/admin/catalog/collections"
          className="group rounded-lg border bg-card p-6 transition-colors hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Koleksiyonlar</p>
              <p className="mt-1 text-3xl font-bold">{collections.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground group-hover:text-primary">
            Koleksiyonları yönet →
          </p>
        </Link>
      </div>

      {/* Recent Items */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold">Son Eklenen Ürünler</h2>
          <Link
            href="/admin/catalog/items/new"
            className="text-sm text-primary hover:underline"
          >
            + Yeni Ekle
          </Link>
        </div>
        {recentItems.length > 0 ? (
          <ul className="divide-y">
            {recentItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/admin/catalog/items/${item.id}`}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-accent/50"
                >
                  {item.image_url ? (
                    <div className="relative h-10 w-10 rounded overflow-hidden">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                      <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.price ? `${item.price} ₺` : 'Fiyat belirtilmemiş'}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      item.is_active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {item.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-8 text-center text-muted-foreground">
            <p>Henüz ürün eklenmemiş</p>
            <Link
              href="/admin/catalog/items/new"
              className="mt-2 inline-block text-sm text-primary hover:underline"
            >
              İlk ürününüzü ekleyin →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
