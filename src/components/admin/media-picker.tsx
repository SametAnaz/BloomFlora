/**
 * Media Picker Component
 * Select existing media or upload new
 */

'use client';

import { useState, useEffect } from 'react';

import Image from 'next/image';

import { getPublicUrl, type MediaFile } from '@/lib/media';
import { createClient } from '@/lib/supabase/client';

import { MediaUpload } from './media-upload';

interface MediaPickerProps {
  value?: string;
  onChange: (url: string | null) => void;
  onClose?: () => void;
}

export function MediaPicker({ value, onChange, onClose }: MediaPickerProps) {
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Load media library on mount and when value changes
  useEffect(() => {
    const loadMedia = async () => {
      setIsLoading(true);
      const supabase = createClient();

      const { data } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      const mediaWithUrls: MediaFile[] = ((data || []) as Array<Omit<MediaFile, 'url'>>).map((item) => ({
        ...item,
        url: getPublicUrl(item.path),
      }));

      setMedia(mediaWithUrls);
      setIsLoading(false);

      // Set selected if value matches
      if (value) {
        const found = mediaWithUrls.find((m) => m.url === value);
        if (found) {
          setSelectedId(found.id);
        }
      }
    };

    loadMedia();
  }, [value]);

  const handleUploadComplete = (file: MediaFile) => {
    setMedia((prev) => [file, ...prev]);
    setSelectedId(file.id);
    setTab('library');
  };

  const handleSelect = () => {
    const selected = media.find((m) => m.id === selectedId);
    if (selected) {
      onChange(selected.url);
    }
    onClose?.();
  };

  const handleClear = () => {
    onChange(null);
    setSelectedId(null);
    onClose?.();
  };

  return (
    <div className="flex h-[500px] flex-col rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Medya Seç</h3>
        {onClose ? (
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-accent"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setTab('library')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'library'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Medya Kütüphanesi
        </button>
        <button
          onClick={() => setTab('upload')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'upload'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Yeni Yükle
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {tab === 'library' ? (
          isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : media.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {media.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    selectedId === item.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-muted-foreground/25'
                  }`}
                >
                  <Image
                    src={item.url}
                    alt={item.alt_text || item.filename}
                    fill
                    className="object-cover"
                  />
                  {selectedId === item.id ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                      <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <svg className="mb-4 h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mb-2 text-muted-foreground">Henüz medya yok</p>
              <button
                onClick={() => setTab('upload')}
                className="text-sm text-primary hover:underline"
              >
                İlk resmi yükle
              </button>
            </div>
          )
        ) : (
          <MediaUpload
            onUploadComplete={handleUploadComplete}
            multiple={false}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-4 py-3">
        <button
          onClick={handleClear}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Seçimi Temizle
        </button>
        <div className="flex gap-2">
          {onClose ? (
            <button
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              İptal
            </button>
          ) : null}
          <button
            onClick={handleSelect}
            disabled={!selectedId}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Seç
          </button>
        </div>
      </div>
    </div>
  );
}
