'use client';

import { useState } from 'react';

import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];      // all gallery images
  coverImage: string;    // primary / cover
  alt: string;
  isFeatured?: boolean;
}

export function ProductGallery({ images, coverImage, alt, isFeatured }: ProductGalleryProps) {
  // Deduplicate: cover first, then rest
  const allImages = [
    coverImage,
    ...images.filter((img) => img !== coverImage),
  ].filter(Boolean) as string[];

  const [selected, setSelected] = useState(allImages[0] || '');

  if (allImages.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#E8D5D0] bg-white shadow-sm">
        <div className="flex h-full items-center justify-center bg-[#F5E6E8]">
          <svg className="h-24 w-24 text-[#D4919A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#E8D5D0] bg-white shadow-sm">
        <Image
          src={selected}
          alt={alt}
          fill
          className="object-cover transition-opacity duration-200"
          priority
        />
        {isFeatured && (
          <span className="absolute left-4 top-4 rounded-full bg-[#8B3A4A] px-4 py-1.5 text-sm font-medium text-white shadow-lg">
            Öne Çıkan
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img) => (
            <button
              key={img}
              type="button"
              onClick={() => setSelected(img)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                selected === img
                  ? 'border-[#8B3A4A]'
                  : 'border-transparent hover:border-[#D4919A]'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
