/**
 * Category Detail Page
 * Displays all items in a specific category
 */

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type ItemRow = Database['public']['Tables']['items']['Row'];

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

  const items = (itemsData || []) as unknown as ItemRow[];

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
          <nav className="mb-4 flex items-center gap-2 text-sm text-[#C4959E]">
            <Link href="/" className="hover:text-[#F5E6E8]">
              Ana Sayfa
            </Link>
            <span>/</span>
            <Link href="/urunler" className="hover:text-[#F5E6E8]">
              Ürünler
            </Link>
            <span>/</span>
            <span className="text-[#F5E6E8]">{category.name}</span>
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
            {items.length > 0 ? (
              <>
                <p className="mb-6 text-sm text-[#8B6F75]">
                  {items.length} ürün bulundu
                </p>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/urunler/${category.slug}/${item.slug}`}
                      className="group overflow-hidden rounded-xl border border-[#E8D5D0] bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-[#F5E6E8]">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <svg
                              className="h-16 w-16 text-[#D4919A]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        {item.is_featured ? (
                          <span className="absolute left-3 top-3 rounded-full bg-[#8B3A4A] px-3 py-1 text-xs font-medium text-white">
                            Öne Çıkan
                          </span>
                        ) : null}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-[#4D1D2A] group-hover:text-[#8B3A4A]">
                          {item.name}
                        </h3>
                        {item.description ? (
                          <p className="mt-1 line-clamp-2 text-sm text-[#8B6F75]">
                            {item.description}
                          </p>
                        ) : null}
                        {item.price ? (
                          <p className="mt-2 text-lg font-bold text-[#8B3A4A]">
                            {item.price.toLocaleString('tr-TR')} ₺
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg
                  className="mb-4 h-16 w-16 text-[#D4919A]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-[#4D1D2A]">
                  Bu kategoride henüz ürün yok
                </h3>
                <p className="mt-1 text-sm text-[#8B6F75]">
                  Yakında yeni ürünler eklenecek
                </p>
                <Link
                  href="/urunler"
                  className="mt-4 rounded-lg bg-[#4D1D2A] px-6 py-2 text-sm font-medium text-[#F5E6E8] hover:bg-[#6B2D3D]"
                >
                  Tüm Kategorilere Dön
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
