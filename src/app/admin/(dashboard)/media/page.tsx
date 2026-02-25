/**
 * Media Library Page
 * Admin page to manage all media files
 */

'use client';

import { useState, useEffect } from 'react';

import Image from 'next/image';

import { MediaUpload } from '@/components/admin/media-upload';

import {
  getPublicUrl,
  deleteFile,
  formatFileSize,
  type MediaFile,
} from '@/lib/media';
import { createClient } from '@/lib/supabase/client';

// Force dynamic rendering (uses cookies for Supabase)
export const dynamic = 'force-dynamic';

interface StorageUsage {
  used: number;
  limit: number;
  fileCount: number;
  percentage: number;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);

  // Fetch storage usage
  const fetchStorageUsage = async () => {
    try {
      const res = await fetch('/api/media/storage');
      const data = await res.json();
      if (data.success) {
        setStorageUsage({
          used: data.used,
          limit: data.limit,
          fileCount: data.fileCount,
          percentage: data.percentage,
        });
      }
    } catch {
      // silently ignore
    }
  };

  // Load media on mount
  useEffect(() => {
    const loadMedia = async () => {
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
    };

    loadMedia();
    fetchStorageUsage();
  }, []);

  const handleUploadComplete = (file: MediaFile) => {
    setMedia((prev) => [file, ...prev]);
    fetchStorageUsage();
  };

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === media.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(media.map((m) => m.id));
    }
  };

  const handleDelete = async () => {
    if (selectedItems.length === 0) return;
    // eslint-disable-next-line no-alert
    if (!window.confirm(`${selectedItems.length} dosyayı silmek istediğinizden emin misiniz?`)) return;

    setIsDeleting(true);

    for (const id of selectedItems) {
      const item = media.find((m) => m.id === id);
      if (item) {
        await deleteFile(id, item.path);
      }
    }

    setMedia((prev) => prev.filter((m) => !selectedItems.includes(m.id)));
    setSelectedItems([]);
    setIsDeleting(false);
    fetchStorageUsage();
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch {
      // Fallback for older browsers
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medya Kütüphanesi</h1>
          <p className="text-muted-foreground">
            Resim ve dosyalarınızı yönetin
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Yeni Yükle
        </button>
      </div>

      {/* Storage Usage Indicator */}
      {storageUsage ? (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <span className="text-sm font-medium">Depolama Alanı</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {storageUsage.fileCount} dosya
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                storageUsage.percentage >= 90
                  ? 'bg-destructive'
                  : storageUsage.percentage >= 70
                    ? 'bg-yellow-500'
                    : 'bg-primary'
              }`}
              style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
            />
          </div>

          {/* Labels */}
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{formatFileSize(storageUsage.used)}</span>
              {' '}/ {formatFileSize(storageUsage.limit)} kullanılıyor
            </span>
            <span>
              {storageUsage.percentage >= 90 ? (
                <span className="font-medium text-destructive">
                  %{storageUsage.percentage} — Alan azalıyor!
                </span>
              ) : (
                <span>
                  {formatFileSize(storageUsage.limit - storageUsage.used)} kalan
                </span>
              )}
            </span>
          </div>
        </div>
      ) : null}

      {/* Upload Section */}
      {showUpload ? (
        <div className="rounded-lg border bg-card p-6">
          <MediaUpload
            onUploadComplete={handleUploadComplete}
            multiple={true}
          />
        </div>
      ) : null}

      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Select All */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedItems.length === media.length && media.length > 0}
              onChange={selectAll}
              className="h-4 w-4 rounded border-input"
            />
            <span className="text-muted-foreground">
              {selectedItems.length > 0
                ? `${selectedItems.length} seçili`
                : 'Tümünü seç'}
            </span>
          </label>

          {/* Delete Selected */}
          {selectedItems.length > 0 ? (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 text-sm text-destructive hover:underline disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              Seçilenleri Sil
            </button>
          ) : null}
        </div>

        {/* View Mode Toggle */}
        <div className="flex rounded-md border">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-accent' : 'hover:bg-accent/50'}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-accent' : 'hover:bg-accent/50'}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Media Grid/List */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : media.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {media.map((item) => (
              <div
                key={item.id}
                className={`group relative aspect-square overflow-hidden rounded-lg border transition-all ${
                  selectedItems.includes(item.id)
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-muted-foreground/25'
                }`}
              >
                {/* Checkbox */}
                <div className="absolute left-2 top-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="h-4 w-4 rounded border-input bg-background"
                  />
                </div>

                {/* Image */}
                <Image
                  src={item.url}
                  alt={item.alt_text || item.filename}
                  fill
                  className="object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="w-full p-3">
                    <p className="truncate text-xs font-medium text-white">
                      {item.filename}
                    </p>
                    <p className="text-xs text-white/70">
                      {formatFileSize(item.size)}
                    </p>
                    <button
                      onClick={() => copyUrl(item.url)}
                      className="mt-2 text-xs text-white/80 hover:text-white"
                    >
                      URL Kopyala
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === media.length}
                      onChange={selectAll}
                      className="h-4 w-4 rounded border-input"
                    />
                  </th>
                  <th className="w-16 px-4 py-3 text-left text-sm font-medium">
                    Önizleme
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Dosya Adı
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Boyut
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Boyutlar
                  </th>
                  <th className="w-24 px-4 py-3 text-left text-sm font-medium">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {media.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="h-4 w-4 rounded border-input"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded">
                        <Image
                          src={item.url}
                          alt={item.filename}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{item.filename}</p>
                      <p className="text-xs text-muted-foreground">{item.mime_type}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatFileSize(item.size)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.width && item.height
                        ? `${item.width} × ${item.height}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => copyUrl(item.url)}
                        className="text-sm text-primary hover:underline"
                      >
                        URL Kopyala
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <svg className="mb-4 h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mb-4 text-muted-foreground">Henüz medya yok</p>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            İlk Resmi Yükle
          </button>
        </div>
      )}
    </div>
  );
}
