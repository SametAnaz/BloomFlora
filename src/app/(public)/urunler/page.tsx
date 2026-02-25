/**
 * Ürünler (Catalog) Page
 * Displays all active categories as a catalog grid
 * Content is managed via Admin > Katalog (categories & items CRUD)
 */

import Image from 'next/image';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ürünler | Bloom Flora',
  description: 'Bloom Flora ürün ve hizmet kataloğu. Çiçek buketleri, aranjmanlar ve daha fazlası.',
};

type CategoryRow = Database['public']['Tables']['categories']['Row'];

export default async function UrunlerPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true });

  const cats = (categories || []) as unknown as CategoryRow[];

  // Also fetch featured items for a highlight section
  const { data: featuredItems } = await supabase
    .from('items')
    .select('*, categories!items_category_id_fkey(name, slug)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('order', { ascending: true })
    .limit(8);

  const featured = (featuredItems || []) as unknown as Array<
    Database['public']['Tables']['items']['Row'] & {
      categories: { name: string; slug: string } | null;
    }
  >;

  return (
    <div className="min-h-screen bg-[#FDF6F0]">
      {/* Hero Banner */}
      <section className="bg-[#4D1D2A] py-16 text-center text-[#F5E6E8]">
        <div className="container-mobile">
          <h1 className="text-4xl font-bold md:text-5xl">Ürünlerimiz</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#C4959E]">
            Her özel anınız için özenle hazırlanmış çiçek aranjmanları ve buketler
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container-mobile py-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-[#4D1D2A] md:text-3xl">
          Kategoriler
        </h2>

        {cats.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((cat) => (
              <Link
                key={cat.id}
                href={`/urunler/${cat.slug}`}
                className="group overflow-hidden rounded-2xl border border-[#E8D5D0] bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5E6E8]">
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#4D1D2A] group-hover:text-[#8B3A4A]">
                    {cat.name}
                  </h3>
                  {cat.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-[#8B6F75]">
                      {cat.description}
                    </p>
                  ) : null}
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#8B3A4A]">
                    Keşfet
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-[#8B6F75]">
            <p className="text-lg">Henüz kategori eklenmemiş.</p>
          </div>
        )}
      </section>

      {/* Featured Items */}
      {featured.length > 0 ? (
        <section className="border-t border-[#E8D5D0] bg-white py-16">
          <div className="container-mobile">
            <h2 className="mb-8 text-center text-2xl font-bold text-[#4D1D2A] md:text-3xl">
              Öne Çıkan Ürünler
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((item) => (
                <Link
                  key={item.id}
                  href={`/urunler/${item.categories?.slug || 'genel'}/${item.slug}`}
                  className="group overflow-hidden rounded-xl border border-[#E8D5D0] bg-white shadow-sm transition-all hover:shadow-md"
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
                          className="h-12 w-12 text-[#D4919A]"
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
                  </div>
                  <div className="p-4">
                    {item.categories?.name ? (
                      <span className="text-xs font-medium uppercase tracking-wider text-[#8B3A4A]">
                        {item.categories.name}
                      </span>
                    ) : null}
                    <h3 className="mt-1 font-semibold text-[#4D1D2A]">
                      {item.name}
                    </h3>
                    {item.price ? (
                      <p className="mt-1 text-lg font-bold text-[#8B3A4A]">
                        {item.price.toLocaleString('tr-TR')} ₺
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
