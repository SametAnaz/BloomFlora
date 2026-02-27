/**
 * GalleryField Component
 * Multi-image gallery management for product admin forms.
 * Covers selecting a cover image and adding/removing photos.
 */

'use client';

import { useState } from 'react';

import Image from 'next/image';

import { MediaPicker } from './media-picker';

interface GalleryFieldProps {
  images: string[];
  coverImage: string;
  onImagesChange: (images: string[]) => void;
  onCoverChange: (url: string) => void;
}

export function GalleryField({
  images,
  coverImage,
  onImagesChange,
  onCoverChange,
}: GalleryFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  const addImage = (url: string) => {
    if (!url || images.includes(url)) return;
    const next = [...images, url];
    onImagesChange(next);
    if (!coverImage) onCoverChange(url);
  };

  const removeImage = (url: string) => {
    const next = images.filter((img) => img !== url);
    onImagesChange(next);
    if (coverImage === url) onCoverChange(next[0] || '');
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {images.map((url) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
          >
            <Image src={url} alt="" fill className="object-cover" />

            {/* Cover badge */}
            {coverImage === url && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow">
                Kapak
              </span>
            )}

            {/* Hover actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              {coverImage !== url && (
                <button
                  type="button"
                  title="Kapak yap"
                  onClick={() => onCoverChange(url)}
                  className="inline-flex items-center justify-center rounded-full bg-white p-1.5 text-yellow-500 shadow transition-colors hover:bg-yellow-500 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                title="Kaldır"
                onClick={() => removeImage(url)}
                className="inline-flex items-center justify-center rounded-full bg-white p-1.5 text-destructive shadow transition-colors hover:bg-destructive hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* Add button */}
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs">Fotoğraf Ekle</span>
        </button>
      </div>

      {images.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          ⭐ ikonuna tıklayarak kapak fotoğrafını değiştirebilirsiniz.
        </p>
      )}

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl">
            <MediaPicker
              value={undefined}
              onChange={(url) => {
                if (url) addImage(url);
                setShowPicker(false);
              }}
              onClose={() => setShowPicker(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
