/**
 * Image Field Component
 * Reusable image upload field for admin forms
 * Uses the MediaPicker for library + upload functionality
 */

'use client';

import { useState } from 'react';

import Image from 'next/image';

import { MediaPicker } from './media-picker';

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export function ImageField({
  label,
  value,
  onChange,
  placeholder = 'Görsel seçin veya yükleyin',
}: ImageFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>

      {value ? (
        <div className="space-y-2">
          <div className="relative h-40 w-full overflow-hidden rounded-lg border">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
            >
              Değiştir
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
            >
              Kaldır
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input py-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">{placeholder}</span>
        </button>
      )}

      {showPicker ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl">
            <MediaPicker
              value={value || undefined}
              onChange={(url) => {
                onChange(url || '');
                setShowPicker(false);
              }}
              onClose={() => setShowPicker(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
