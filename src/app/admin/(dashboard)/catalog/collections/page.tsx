/**
 * Collections List Page
 * Admin page to manage item collections
 */

import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type CollectionRow = Database['public']['Tables']['collections']['Row'];

export default async function CollectionsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('collections')
    .select('*')
    .order('order', { ascending: true });

  const collections = (data || []) as unknown as CollectionRow[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Koleksiyonlar</h1>
          <p className="text-muted-foreground">
            Ürün/hizmet koleksiyonlarını yönetin
          </p>
        </div>
        <Link
          href="/admin/catalog/collections/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Koleksiyon
        </Link>
      </div>

      {/* Collections Grid */}
      {collections.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/admin/catalog/collections/${collection.id}`}
              className="group rounded-lg border bg-card p-6 transition-colors hover:border-primary"
            >
              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>

              {/* Content */}
              <div>
                <h3 className="mb-1 font-semibold group-hover:text-primary">
                  {collection.name}
                </h3>
                {collection.description ? (
                  <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                    {collection.description}
                  </p>
                ) : null}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    {collection.item_ids?.length ?? 0} ürün
                  </span>
                  <span className={collection.is_active ? 'text-green-600' : 'text-red-600'}>
                    {collection.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <svg className="mb-4 h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="mb-4 text-muted-foreground">Henüz koleksiyon yok</p>
          <Link
            href="/admin/catalog/collections/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            İlk Koleksiyonu Oluştur
          </Link>
        </div>
      )}
    </div>
  );
}
