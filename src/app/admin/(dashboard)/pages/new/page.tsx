/**
 * New Page Creation Page
 * Create a new page then redirect to editor
 */

'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type PageInsert = Database['public']['Tables']['pages']['Insert'];
type PageRow = Database['public']['Tables']['pages']['Row'];

export default function NewPagePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
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
    if (!title.trim()) {
      setError('Sayfa başlığı gerekli');
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
        .from('pages')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existing) {
        setError('Bu URL zaten kullanılıyor');
        setIsCreating(false);
        return;
      }

      // Create new page
      const insertData: PageInsert = {
        title,
        slug,
        status: 'draft',
        blocks: [],
        is_homepage: false,
      };
      
      const { data, error: createError } = await supabase
        .from('pages')
        .insert(insertData as never)
        .select()
        .single();

      if (createError) throw createError;

      const newPage = data as unknown as PageRow;

      // Redirect to editor
      router.push(`/admin/pages/${newPage.id}`);
    } catch (err) {
      console.error('Create error:', err);
      setError('Sayfa oluşturulurken hata oluştu');
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">Yeni Sayfa Oluştur</h1>
        <p className="text-sm text-muted-foreground">
          Sayfa bilgilerini girin, ardından düzenleme ekranına yönlendirileceksiniz
        </p>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Sayfa Başlığı
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Örn: Hakkımızda"
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium">
            URL Slug
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">yourdomain.com/</span>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="hakkimizda"
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => router.push('/admin/pages')}
            className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
          >
            İptal
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? 'Oluşturuluyor...' : 'Oluştur ve Düzenle'}
          </button>
        </div>
      </div>
    </div>
  );
}
