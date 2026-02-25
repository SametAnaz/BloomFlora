/**
 * New Item Page
 * Create a new product/service
 */

'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { ImageField } from '@/components/admin/image-field';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

// Force dynamic rendering (uses cookies for Supabase)
export const dynamic = 'force-dynamic';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type ItemInsert = Database['public']['Tables']['items']['Insert'];

export default function NewItemPage() {
  const router = useRouter();
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
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      setCategories((data || []) as unknown as CategoryRow[]);
    };
    loadCategories();
  }, []);

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
      setError('Ürün adı gerekli');
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
        .from('items')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existing) {
        setError('Bu URL zaten kullanılıyor');
        setIsCreating(false);
        return;
      }

      // Create item
      const insertData: ItemInsert = {
        name,
        slug,
        description: description || null,
        price: price ? Number(price) : null,
        image_url: imageUrl || null,
        category_id: categoryId || null,
        is_active: isActive,
        is_featured: isFeatured,
      };

      console.log('[items/new] Inserting:', JSON.stringify(insertData));

      const { data: insertedData, error: createError } = await supabase
        .from('items')
        .insert(insertData as never)
        .select();

      console.log('[items/new] Result:', { insertedData, createError });

      if (createError) {
        const msg = createError.message || createError.details || JSON.stringify(createError);
        setError(`Hata: ${msg}`);
        setIsCreating(false);
        return;
      }

      router.push('/admin/catalog/items');
      router.refresh();
    } catch (err: unknown) {
      const e = err as { message?: string; details?: string; code?: string };
      console.error('Create error:', JSON.stringify(err), e.message, e.details, e.code);
      setError(`Ürün oluşturulurken hata: ${e.message || JSON.stringify(err)}`);
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">Yeni Ürün / Hizmet</h1>
        <p className="text-sm text-muted-foreground">
          Yeni bir ürün veya hizmet ekleyin
        </p>
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
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Örn: Kırmızı Gül Buketi"
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
              placeholder="kirmizi-gul-buketi"
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
            placeholder="0.00"
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
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Ürün açıklaması (opsiyonel)"
          />
        </div>

        <ImageField
          label="Ürün Görseli"
          value={imageUrl}
          onChange={setImageUrl}
          placeholder="Ürün görseli seçin veya yükleyin"
        />

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
            onClick={handleCreate}
            disabled={isCreating}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? 'Oluşturuluyor...' : 'Ürün Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}
