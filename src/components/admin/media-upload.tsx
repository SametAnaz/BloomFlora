/**
 * Media Upload Component
 * Drag-and-drop file upload with preview
 */

'use client';

import { useState, useCallback, useRef } from 'react';

import {
  uploadFile,
  isAllowedFileType,
  isFileSizeValid,
  formatFileSize,
  MAX_FILE_SIZE,
  type MediaFile,
} from '@/lib/media';

interface MediaUploadProps {
  onUploadComplete?: (file: MediaFile) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  className?: string;
}

export function MediaUpload({
  onUploadComplete,
  onUploadError,
  multiple = false,
  className = '',
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const filesToUpload = multiple ? fileArray : [fileArray[0]];

      setIsUploading(true);
      setUploadProgress([]);

      for (const file of filesToUpload) {
        // Validate file type
        if (!isAllowedFileType(file)) {
          const error = `"${file.name}" desteklenmeyen dosya türü. Sadece resim dosyaları yüklenebilir.`;
          setUploadProgress((prev) => [...prev, `❌ ${error}`]);
          onUploadError?.(error);
          continue;
        }

        // Validate file size
        if (!isFileSizeValid(file)) {
          const error = `"${file.name}" çok büyük. Maksimum boyut: ${formatFileSize(MAX_FILE_SIZE)}`;
          setUploadProgress((prev) => [...prev, `❌ ${error}`]);
          onUploadError?.(error);
          continue;
        }

        setUploadProgress((prev) => [...prev, `⏳ "${file.name}" yükleniyor...`]);

        const result = await uploadFile(file);

        if (result.success && result.file) {
          setUploadProgress((prev) =>
            prev.map((p) =>
              p.includes(file.name) ? `✅ "${file.name}" başarıyla yüklendi` : p
            )
          );
          onUploadComplete?.(result.file);
        } else {
          setUploadProgress((prev) =>
            prev.map((p) =>
              p.includes(file.name)
                ? `❌ "${file.name}" yüklenemedi: ${result.error}`
                : p
            )
          );
          onUploadError?.(result.error || 'Yükleme başarısız');
        }
      }

      setIsUploading(false);

      // Clear progress after 3 seconds
      setTimeout(() => {
        setUploadProgress([]);
      }, 3000);
    },
    [multiple, onUploadComplete, onUploadError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  return (
    <div className={className}>
      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          {isUploading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isUploading ? 'Yükleniyor...' : 'Resim yüklemek için tıklayın veya sürükleyin'}
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF, WebP veya SVG (maks. {formatFileSize(MAX_FILE_SIZE)})
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="mt-4 space-y-1">
          {uploadProgress.map((progress, index) => (
            <p key={index} className="text-sm">
              {progress}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
