/**
 * Edit Category Page
 * Edit an existing category
 */

'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

// Force dynamic rendering (uses cookies for Supabase)
export const dynamic = 'force-dynamic';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategory = async () => {
      const { id } = await params;
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.push('/admin/catalog/categories');
        return;
      }

      const cat = data as unknown as CategoryRow;
      setCategory(cat);
      setName(cat.name);
      setSlug(cat.slug);
      setDescription(cat.description || '');
      setIsActive(cat.is_active);
      setOrder(cat.order);
      setIsLoading(false);
    };

    loadCategory();
  }, [params, router]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Kategori adı gerekli');
      return;
    }
    if (!slug.trim()) {
      setError('URL slug gerekli');
      return;
    }
    if (!category) return;

    setIsSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check if slug exists (excluding current)
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', category.id)
        .single();

      if (existing) {
        setError('Bu URL başka bir kategori tarafından kullanılıyor');
        setIsSaving(false);
        return;
      }

      const updateData = {
        name,
        slug,
        description: description || null,
        is_active: isActive,
        order,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('categories')
        .update(updateData as never)
        .eq('id', category.id);

      if (updateError) throw updateError;

      router.push('/admin/catalog/categories');
      router.refresh();
    } catch (err) {
      console.error('Update error:', err);
      setError('Kategori güncellenirken hata oluştu');
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    // eslint-disable-next-line no-alert
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    setIsDeleting(true);

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (deleteError) throw deleteError;

      router.push('/admin/catalog/categories');
      router.refresh();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Kategori silinirken hata oluştu');
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
          <h1 className="text-2xl font-bold">Kategori Düzenle</h1>
          <p className="text-sm text-muted-foreground">
            Kategori bilgilerini güncelleyin
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
            Kategori Adı
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
            <span className="text-sm text-muted-foreground">/kategori/</span>
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
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Açıklama
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Kategori açıklaması (opsiyonel)"
          />
        </div>

        <div>
          <label htmlFor="order" className="mb-1 block text-sm font-medium">
            Sıralama
          </label>
          <input
            id="order"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

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

        {error ? (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => router.push('/admin/catalog/categories')}
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
