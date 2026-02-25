/**
 * Storage Usage API
 * Returns current storage usage from the media table
 * GET /api/media/storage
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 1 GB in bytes
const STORAGE_LIMIT = 1 * 1024 * 1024 * 1024;

export async function GET() {
  try {
    const supabase = await createClient();

    // Sum all file sizes from media table
    const { data, error } = await supabase
      .from('media')
      .select('size');

    if (error) {
      console.error('[Storage] Query error:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const files = (data || []) as { size: number | null }[];
    const totalUsed = files.reduce((sum, row) => sum + (row.size || 0), 0);
    const fileCount = files.length;

    return NextResponse.json({
      success: true,
      used: totalUsed,
      limit: STORAGE_LIMIT,
      fileCount,
      percentage: Math.round((totalUsed / STORAGE_LIMIT) * 10000) / 100, // 2 decimal precision
    });
  } catch (err) {
    console.error('[Storage] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Storage bilgisi alınamadı' },
      { status: 500 }
    );
  }
}
