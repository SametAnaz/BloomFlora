/**
 * Category Detail Page
 * Displays all items in a specific category
 */

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import ItemsGrid from './items-grid';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single() as unknown as { data: { name: string; description: string | null } | null };

  if (!data) return { title: 'Kategori Bulunamadı | Bloom Flora' };

  return {
    title: `${data.name} | Bloom Flora`,
    description: data.description || `${data.name} kategorisindeki ürünlerimizi keşfedin.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch category
  const { data: categoryData } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!categoryData) {
    notFound();
  }

  const category = categoryData as unknown as CategoryRow;

  // Fetch items in this category
  const { data: itemsData } = await supabase
    .from('items')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('order', { ascending: true });

  const items = (itemsData || []) as unknown as Database['public']['Tables']['items']['Row'][];

  // Fetch all categories for sidebar navigation
  const { data: allCatsData } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true });

  const allCategories = (allCatsData || []) as unknown as CategoryRow[];

  return (
    <div className="min-h-screen bg-[#FDF6F0]">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-[#4D1D2A] py-16 text-[#F5E6E8]">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover opacity-20"
          />
        ) : null}
        <div className="container-mobile relative z-10">
          {/* Breadcrumb */}
          <nav className="mb-4 flex flex-wrap items-center gap-y-1 text-sm text-[#C4959E]">
            <Link href="/" className="hover:text-[#F5E6E8] whitespace-nowrap">
              Ana Sayfa
            </Link>
            <span className="mx-2 select-none">{'/'}</span>
            <Link href="/urunler" className="hover:text-[#F5E6E8] whitespace-nowrap">
              Ürünler
            </Link>
            <span className="mx-2 select-none">{'/'}</span>
            <span className="text-[#F5E6E8] whitespace-nowrap">{category.name}</span>
          </nav>

          <h1 className="text-4xl font-bold md:text-5xl">{category.name}</h1>
          {category.description ? (
            <p className="mt-4 max-w-2xl text-lg text-[#C4959E]">
              {category.description}
            </p>
          ) : null}
        </div>
      </section>

      <div className="container-mobile py-12">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Sidebar — Category Navigation */}
          <aside className="lg:w-64 lg:shrink-0">
            <div className="sticky top-20 rounded-xl border border-[#E8D5D0] bg-white p-5">
              <h3 className="mb-4 font-semibold text-[#4D1D2A]">Kategoriler</h3>
              <nav className="space-y-1">
                <Link
                  href="/urunler"
                  className="block rounded-lg px-3 py-2 text-sm text-[#8B6F75] transition-colors hover:bg-[#F5E6E8] hover:text-[#4D1D2A]"
                >
                  Tümü
                </Link>
                {allCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/urunler/${cat.slug}`}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      cat.id === category.id
                        ? 'bg-[#4D1D2A] font-medium text-[#F5E6E8]'
                        : 'text-[#8B6F75] hover:bg-[#F5E6E8] hover:text-[#4D1D2A]'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Items Grid */}
          <div className="flex-1">
            <ItemsGrid items={items} categorySlug={category.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
