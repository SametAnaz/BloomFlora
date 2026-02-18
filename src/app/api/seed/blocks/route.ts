/**
 * Load Default Blocks API
 * POST /api/seed/blocks — force-loads default blocks into a given page
 */

import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { defaultHomepageBlocks } from '@/lib/defaults/homepage-blocks';

export async function POST(request: Request) {
  try {
    const { pageId } = (await request.json()) as { pageId?: string };

    if (!pageId) {
      return NextResponse.json(
        { success: false, message: 'pageId gerekli' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('pages')
      .update({
        blocks: defaultHomepageBlocks as never,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', pageId);

    if (error) {
      console.error('[Seed Blocks] Error:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blocks: defaultHomepageBlocks,
    });
  } catch (error) {
    console.error('[Seed Blocks] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
