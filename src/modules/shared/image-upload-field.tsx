/**
 * Shared Image Upload Field
 * Reusable component for image upload across all module editors.
 * Provides: file upload to Supabase, media gallery picker, URL paste, and preview.
 */

import * as React from 'react';

interface ImageUploadFieldProps {
  /** Current image URL */
  value?: string;
  /** Callback when image changes */
  onChange: (url: string) => void;
  /** Callback to clear image */
  onClear?: () => void;
  /** Supabase storage folder (e.g., 'hero', 'team', 'gallery') */
  folder?: string;
  /** Label text */
  label?: string;
  /** Show URL input field */
  showUrlInput?: boolean;
  /** Preview aspect ratio class */
  previewClass?: string;
  /** Compact mode - smaller buttons */
  compact?: boolean;
}

export function ImageUploadField({
  value,
  onChange,
  onClear,
  folder = 'uploads',
  label,
  showUrlInput = true,
  previewClass = 'h-32 w-full object-cover',
  compact = false,
}: ImageUploadFieldProps) {
  const [showMediaPicker, setShowMediaPicker] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { uploadFile } = await import('@/lib/media');
      const result = await uploadFile(file, folder);
      if (result.success && result.file) {
        onChange(result.file.url);
      }
    } catch {
      // silently fail
    }
    setUploading(false);
    e.target.value = '';
  };

  const btnBase = compact
    ? 'rounded-md border px-2 py-1.5 text-xs font-medium transition-colors'
    : 'rounded-md border px-3 py-2.5 text-sm font-medium transition-colors';

  return (
    <div className="space-y-2">
      {label && <label className="mb-1 block text-sm font-medium">{label}</label>}

      {/* Preview */}
      {value && (
        <div className="relative overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className={previewClass} />
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 border-dashed border-input hover:border-primary hover:text-primary disabled:opacity-50 ${btnBase}`}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Yükleniyor...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Yükle
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowMediaPicker(true)}
          className={`flex-1 border-input hover:bg-accent ${btnBase}`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Galeri
          </span>
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

      {/* URL input */}
      {showUrlInput && (
        <div>
          <label className="mb-0.5 block text-xs text-muted-foreground">veya URL yapıştır</label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            placeholder="https://..."
          />
        </div>
      )}

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPickerModal
          value={value}
          onSelect={(url) => {
            if (url) onChange(url);
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}

// Lazy-loaded MediaPicker modal
function MediaPickerModal({
  value,
  onSelect,
  onClose,
}: {
  value?: string;
  onSelect: (url: string | null) => void;
  onClose: () => void;
}) {
  const [MediaPickerComponent, setMediaPickerComponent] = React.useState<React.ComponentType<{
    value?: string;
    onChange: (url: string | null) => void;
    onClose?: () => void;
  }> | null>(null);

  React.useEffect(() => {
    import('@/components/admin/media-picker').then((mod) => {
      setMediaPickerComponent(() => mod.MediaPicker);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        {MediaPickerComponent ? (
          <MediaPickerComponent value={value} onChange={onSelect} onClose={onClose} />
        ) : (
          <div className="flex h-[500px] items-center justify-center rounded-lg bg-card">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
