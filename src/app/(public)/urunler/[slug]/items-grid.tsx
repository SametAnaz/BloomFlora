'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import type { Database, ItemAttribute } from '@/lib/supabase/types';

type ItemRow = Database['public']['Tables']['items']['Row'];

const PAGE_SIZE = 12;

interface ItemsGridProps {
  items: ItemRow[];
  categorySlug: string;
}

export default function ItemsGrid({ items, categorySlug }: ItemsGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pagedItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg className="mb-4 h-16 w-16 text-[#D4919A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 className="text-lg font-semibold text-[#4D1D2A]">Bu kategoride henüz ürün yok</h3>
        <p className="mt-1 text-sm text-[#8B6F75]">Yakında yeni ürünler eklenecek</p>
        <Link href="/urunler" className="mt-4 rounded-lg bg-[#4D1D2A] px-6 py-2 text-sm font-medium text-[#F5E6E8] hover:bg-[#6B2D3D]">
          Tüm Kategorilere Dön
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-[#8B6F75]">
          <span className="font-medium text-[#4D1D2A]">{items.length}</span> ürün bulundu
          {totalPages > 1 && (
            <span className="ml-1 text-[#8B6F75]">— sayfa {currentPage}/{totalPages}</span>
          )}
        </p>
        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-[#E8D5D0] bg-white p-1">
          <button
            onClick={() => setViewMode('grid')}
            title="Döşeme görünümü"
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#4D1D2A] text-[#F5E6E8]'
                : 'text-[#8B6F75] hover:text-[#4D1D2A]'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="Liste görünümü"
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-[#4D1D2A] text-[#F5E6E8]'
                : 'text-[#8B6F75] hover:text-[#4D1D2A]'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {pagedItems.map((item) => (
            <Link
              key={item.id}
              href={`/urunler/${categorySlug}/${item.slug}`}
              className="group overflow-hidden rounded-xl border border-[#E8D5D0] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-[#F5E6E8]">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <svg className="h-16 w-16 text-[#D4919A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {item.is_featured ? (
                  <span className="absolute left-3 top-3 rounded-full bg-[#8B3A4A] px-3 py-1 text-xs font-medium text-white">
                    Öne Çıkan
                  </span>
                ) : null}
                {/* Add to cart icon overlay */}
                <AddToCartButton
                  item={{ id: item.id, name: item.name, slug: item.slug, categorySlug, imageUrl: item.image_url, price: item.price, productCode: item.product_code ?? null, customAttributes: Array.isArray(item.custom_attributes) ? item.custom_attributes as unknown as ItemAttribute[] : [] }}
                  variant="icon"
                  className="absolute bottom-3 right-3 opacity-0 translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[#4D1D2A] group-hover:text-[#8B3A4A]">{item.name}</h3>
                {item.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-[#8B6F75]">{item.description}</p>
                ) : null}
                {item.price ? (
                  <p className="mt-2 text-lg font-bold text-[#8B3A4A]">{item.price.toLocaleString('tr-TR')} ₺</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {pagedItems.map((item) => (
            <Link
              key={item.id}
              href={`/urunler/${categorySlug}/${item.slug}`}
              className="group flex items-center gap-5 overflow-hidden rounded-xl border border-[#E8D5D0] bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#F5E6E8]">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <svg className="h-8 w-8 text-[#D4919A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#4D1D2A] group-hover:text-[#8B3A4A]">{item.name}</h3>
                  {item.is_featured ? (
                    <span className="shrink-0 rounded-full bg-[#8B3A4A]/10 px-2 py-0.5 text-xs font-medium text-[#8B3A4A]">Öne Çıkan</span>
                  ) : null}
                </div>
                {item.description ? (
                  <p className="line-clamp-2 text-sm text-[#8B6F75]">{item.description}</p>
                ) : null}
                {item.price ? (
                  <p className="mt-1 text-base font-bold text-[#8B3A4A]">{item.price.toLocaleString('tr-TR')} ₺</p>
                ) : null}
              </div>
              <AddToCartButton
                item={{ id: item.id, name: item.name, slug: item.slug, categorySlug, imageUrl: item.image_url, price: item.price, productCode: item.product_code ?? null, customAttributes: Array.isArray(item.custom_attributes) ? item.custom_attributes as unknown as ItemAttribute[] : [] }}
                variant="icon"
              />
              <svg className="h-5 w-5 shrink-0 text-[#8B6F75] transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E8D5D0] bg-white text-[#8B6F75] hover:border-[#8B3A4A] hover:text-[#8B3A4A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const isNear = Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
            if (!isNear) {
              const prevNear = Math.abs((page - 1) - currentPage) <= 2 || (page - 1) === 1 || (page - 1) === totalPages;
              if (!prevNear) return null;
              return <span key={`e-${page}`} className="px-1 text-[#8B6F75]">…</span>;
            }
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'border-[#4D1D2A] bg-[#4D1D2A] text-[#F5E6E8]'
                    : 'border-[#E8D5D0] bg-white text-[#4D1D2A] hover:border-[#8B3A4A] hover:text-[#8B3A4A]'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E8D5D0] bg-white text-[#8B6F75] hover:border-[#8B3A4A] hover:text-[#8B3A4A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
