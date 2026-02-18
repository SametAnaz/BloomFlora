/**
 * Media Library Utilities
 * Supabase Storage integration for image upload/delete
 */

import { createClient } from '@/lib/supabase/client';

export const STORAGE_BUCKET = 'media';

export interface MediaFile {
  id: string;
  path: string;
  filename: string;
  url: string;
  alt_text: string | null;
  mime_type: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface UploadResult {
  success: boolean;
  file?: MediaFile;
  error?: string;
}

/**
 * Get public URL for a file path
 */
export function getPublicUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    const supabase = createClient();

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop() || 'bin';
    const filename = `${timestamp}-${randomStr}.${ext}`;
    const path = `${folder}/${filename}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const url = getPublicUrl(path);

    // Get image dimensions if it's an image
    let width: number | null = null;
    let height: number | null = null;

    if (file.type.startsWith('image/')) {
      const dimensions = await getImageDimensions(file);
      width = dimensions.width;
      height = dimensions.height;
    }

    // Insert into media table
    const mediaData = {
      path,
      filename: file.name,
      alt_text: null,
      mime_type: file.type || null,
      size: file.size,
      width,
      height,
    };

    const { data: insertedMedia, error: dbError } = await supabase
      .from('media')
      .insert(mediaData as never)
      .select()
      .single();

    if (dbError) {
      // If DB insert fails, delete the uploaded file
      await supabase.storage.from(STORAGE_BUCKET).remove([path]);
      return { success: false, error: dbError.message };
    }

    const mediaFile: MediaFile = {
      ...(insertedMedia as unknown as Omit<MediaFile, 'url'>),
      url,
    };

    return { success: true, file: mediaFile };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed',
    };
  }
}

/**
 * Delete a file from Supabase Storage and database
 */
export async function deleteFile(id: string, path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (storageError) {
      return { success: false, error: storageError.message };
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (dbError) {
      return { success: false, error: dbError.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Delete failed',
    };
  }
}

/**
 * Get image dimensions from a file
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(file: File): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];
  return allowedTypes.includes(file.type);
}

/**
 * Max file size (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Check if file size is within limit
 */
export function isFileSizeValid(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}
