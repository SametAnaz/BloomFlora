/**
 * Item Detail Page
 * Displays a single product/service with full details
 */

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductComments } from '@/components/comments/product-comments';
import { ProductGallery } from '@/components/product-gallery';
import { getSiteSettings } from '@/lib/settings/getSiteSettings';
import { createClient } from '@/lib/supabase/server';
import type { Database, ItemAttribute } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type ItemRow = Database['public']['Tables']['items']['Row'];

interface ItemPageProps {
  params: Promise<{ slug: string; item: string }>;
}

export async function generateMetadata({ params }: ItemPageProps) {
  const { item: itemSlug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('items')
    .select('name, description')
    .eq('slug', itemSlug)
    .eq('is_active', true)
    .single() as unknown as { data: { name: string; description: string | null } | null };

  if (!data) return { title: 'Ürün Bulunamadı | Bloom Flora' };

  return {
    title: `${data.name} | Bloom Flora`,
    description: data.description || `${data.name} - Bloom Flora`,
  };
}

export default async function ItemDetailPage({ params }: ItemPageProps) {
  const { slug: categorySlug, item: itemSlug } = await params;
  const [supabase, siteSettings] = await Promise.all([
    createClient(),
    getSiteSettings(),
  ]);

  // Fetch item
  const { data: itemData } = await supabase
    .from('items')
    .select('*')
    .eq('slug', itemSlug)
    .eq('is_active', true)
    .single();

  if (!itemData) {
    notFound();
  }

  const item = itemData as unknown as ItemRow;

  // Fetch category
  let category: CategoryRow | null = null;
  if (item.category_id) {
    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .eq('id', item.category_id)
      .single();
    category = catData as unknown as CategoryRow | null;
  }

  // Fetch related items from same category (exclude current)
  let relatedItems: ItemRow[] = [];
  if (item.category_id) {
    const { data: relatedData } = await supabase
      .from('items')
      .select('*')
      .eq('category_id', item.category_id)
      .eq('is_active', true)
      .neq('id', item.id)
      .order('order', { ascending: true })
      .limit(4);

    relatedItems = (relatedData || []) as unknown as ItemRow[];
  }

  return (
    <div className="min-h-screen bg-[#FDF6F0]">
      {/* Breadcrumb */}
      <div className="border-b border-[#E8D5D0] bg-white">
        <div className="container-mobile py-3">
          <nav className="flex flex-wrap items-center gap-y-1 text-sm text-[#8B6F75]">
            <Link href="/" className="hover:text-[#4D1D2A] whitespace-nowrap">
              Ana Sayfa
            </Link>
            <span className="mx-2 text-[#C4959E] select-none">{'/'}</span>
            <Link href="/urunler" className="hover:text-[#4D1D2A] whitespace-nowrap">
              Ürünler
            </Link>
            {category ? (
              <>
                <span className="mx-2 text-[#C4959E] select-none">{'/'}</span>
                <Link
                  href={`/urunler/${category.slug}`}
                  className="hover:text-[#4D1D2A] whitespace-nowrap"
                >
                  {category.name}
                </Link>
              </>
            ) : null}
            <span className="mx-2 text-[#C4959E] select-none">{'/'}</span>
            <span className="font-medium text-[#4D1D2A] whitespace-nowrap">{item.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <section className="container-mobile py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image Gallery */}
          <ProductGallery
            images={Array.isArray((item as unknown as { gallery_images?: unknown }).gallery_images) ? (item as unknown as { gallery_images: string[] }).gallery_images : (item.image_url ? [item.image_url] : [])}
            coverImage={item.image_url || ''}
            alt={item.name}
            isFeatured={item.is_featured}
          />

          {/* Details */}
          <div className="flex flex-col justify-center">
            {category ? (
              <Link
                href={`/urunler/${category.slug}`}
                className="mb-2 inline-flex w-fit items-center gap-1 text-sm font-medium uppercase tracking-wider text-[#8B3A4A] hover:underline"
              >
                {category.name}
              </Link>
            ) : null}

            <h1 className="text-3xl font-bold text-[#4D1D2A] md:text-4xl">
              {item.name}
            </h1>

            {item.price ? (
              <p className="mt-4 text-3xl font-bold text-[#8B3A4A]">
                {item.price.toLocaleString('tr-TR')} ₺
              </p>
            ) : null}

            {item.description ? (
              <div className="mt-6">
                <h3 className="mb-2 font-semibold text-[#4D1D2A]">Açıklama</h3>
                <p className="leading-relaxed text-[#8B6F75] whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            ) : null}

            {/* Add to Cart + WhatsApp CTA */}
            <div className="mt-8 space-y-3">
              <AddToCartButton
                item={{
                  id: item.id,
                  name: item.name,
                  slug: item.slug,
                  categorySlug: categorySlug,
                  imageUrl: item.image_url,
                  price: item.price,
                  productCode: item.product_code ?? null,
                  customAttributes: Array.isArray(item.custom_attributes) ? item.custom_attributes as unknown as ItemAttribute[] : [],
                }}
              />

              <a
                href={`tel:+${siteSettings.whatsapp_number || ''}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#4D1D2A] px-6 py-3 text-base font-semibold text-[#4D1D2A] transition-colors hover:bg-[#4D1D2A] hover:text-[#F5E6E8]"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Bizi Arayın
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related Items */}
      {relatedItems.length > 0 ? (
        <section className="border-t border-[#E8D5D0] bg-white py-16">
          <div className="container-mobile">
            <h2 className="mb-8 text-center text-2xl font-bold text-[#4D1D2A]">
              Benzer Ürünler
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedItems.map((related) => (
                <Link
                  key={related.id}
                  href={`/urunler/${categorySlug}/${related.slug}`}
                  className="group overflow-hidden rounded-xl border border-[#E8D5D0] bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-[#F5E6E8]">
                    {related.image_url ? (
                      <Image
                        src={related.image_url}
                        alt={related.name}
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
                    <h3 className="font-semibold text-[#4D1D2A]">
                      {related.name}
                    </h3>
                    {related.price ? (
                      <p className="mt-1 text-lg font-bold text-[#8B3A4A]">
                        {related.price.toLocaleString('tr-TR')} ₺
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Comments Section */}
      {siteSettings.comments_enabled ? <ProductComments itemId={item.id} /> : null}

      {/* Back Link */}
      <div className="container-mobile py-8">
        <Link
          href={category ? `/urunler/${category.slug}` : '/urunler'}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#8B3A4A] hover:underline"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {category ? `${category.name} kategorisine dön` : 'Tüm ürünlere dön'}
        </Link>
      </div>
    </div>
  );
}
