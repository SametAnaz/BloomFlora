/**
 * New Category Page
 * Create a new product/service category
 */

'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

// Force dynamic rendering (uses cookies for Supabase)
export const dynamic = 'force-dynamic';

type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError('Kategori adı gerekli');
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
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existing) {
        setError('Bu URL zaten kullanılıyor');
        setIsCreating(false);
        return;
      }

      // Get max order
      const { data: maxOrderData } = await supabase
        .from('categories')
        .select('order')
        .order('order', { ascending: false })
        .limit(1)
        .single() as { data: { order: number } | null; error: unknown };

      const nextOrder = (maxOrderData?.order ?? 0) + 1;

      // Create category
      const insertData: CategoryInsert = {
        name,
        slug,
        description: description || null,
        is_active: isActive,
        order: nextOrder,
      };

      const { error: createError } = await supabase
        .from('categories')
        .insert(insertData as never);

      if (createError) throw createError;

      router.push('/admin/catalog/categories');
      router.refresh();
    } catch (err) {
      console.error('Create error:', err);
      setError('Kategori oluşturulurken hata oluştu');
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">Yeni Kategori</h1>
        <p className="text-sm text-muted-foreground">
          Yeni bir ürün/hizmet kategorisi oluşturun
        </p>
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
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Örn: Çiçek Buketleri"
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
              placeholder="cicek-buketleri"
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
            onClick={handleCreate}
            disabled={isCreating}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? 'Oluşturuluyor...' : 'Kategori Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
}
