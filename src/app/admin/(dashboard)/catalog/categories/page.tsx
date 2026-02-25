/**
 * Categories List Page
 * Admin page to manage product/service categories
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

// Force dynamic rendering (uses cookies for Supabase)
export const dynamic = 'force-dynamic';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });
    setCategories((data || []) as unknown as CategoryRow[]);
    setIsLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggleActive = async (e: React.MouseEvent, category: CategoryRow) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !category.is_active, updated_at: new Date().toISOString() } as never)
        .eq('id', category.id);
      if (error) throw error;
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, is_active: !c.is_active } : c))
      );
    } catch {
      // silently ignore
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kategoriler</h1>
          <p className="text-sm text-muted-foreground">
            Ürün ve hizmet kategorilerini yönetin
          </p>
        </div>
        <Link
          href="/admin/catalog/categories/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kategori
        </Link>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/admin/catalog/categories/${category.id}`}
              className="group rounded-lg border bg-card overflow-hidden transition-colors hover:border-primary"
            >
              {/* Image */}
              {category.image_url ? (
                <div className="aspect-video overflow-hidden relative">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-muted">
                  <svg className="h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {category.description || 'Açıklama yok'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleToggleActive(e, category)}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                      category.is_active
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 hover:bg-emerald-500/25'
                        : 'bg-muted text-muted-foreground border border-border hover:bg-accent'
                    }`}
                    title={category.is_active ? 'Pasife al' : 'Aktif yap'}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      category.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'
                    }`} />
                    {category.is_active ? 'Aktif' : 'Pasif'}
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Sıra: {category.order}</span>
                  <span>/{category.slug}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card px-6 py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="mt-4 text-muted-foreground">Henüz kategori oluşturulmamış</p>
          <Link
            href="/admin/catalog/categories/new"
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            İlk kategorinizi oluşturun
          </Link>
        </div>
      )}
    </div>
  );
}
