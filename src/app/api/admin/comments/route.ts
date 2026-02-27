/**
 * Admin Comments API — Protected endpoints
 *
 * GET    /api/admin/comments?status=pending&page=1  → paginated comments list
 * PATCH  /api/admin/comments                         → update comment (approve / reject / edit)
 * DELETE /api/admin/comments                         → delete comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* ── GET: List comments with optional filters ────────────── */

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // ── Thread mode: fetch ancestor chain for a given comment ──
  const threadOf = params.get('thread_of');
  if (threadOf) {
    try {
      const supabase = await createClient();
      const ancestors: Array<{
        id: string; parent_id: string | null; author_name: string;
        body: string; rating: number | null; status: string; created_at: string;
      }> = [];
      let currentId: string | null = threadOf;

      // Walk up the parent chain (max 10 levels to prevent infinite loops)
      for (let i = 0; i < 10 && currentId; i++) {
        const { data: row } = await supabase
          .from('comments')
          .select('id, parent_id, author_name, body, rating, status, created_at')
          .eq('id', currentId)
          .single() as unknown as { data: { id: string; parent_id: string | null; author_name: string; body: string; rating: number | null; status: string; created_at: string } | null };

        if (!row) break;
        ancestors.push(row);
        currentId = row.parent_id;
      }

      // Return ancestors from root → child (reverse the walk-up order)
      return NextResponse.json({ ancestors: ancestors.reverse() });
    } catch {
      return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
  }

  // ── Normal paginated list mode ──
  const status = params.get('status'); // pending | approved | rejected
  const page = Math.max(1, parseInt(params.get('page') || '1', 10));
  const perPage = 20;

  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('comments')
      .select('id, item_id, parent_id, author_name, author_email, body, rating, status, created_at', { count: 'exact' });

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error) {
      return NextResponse.json({ error: (error as { message: string }).message }, { status: 500 });
    }

    const rows = (data || []) as Array<{
      id: string; item_id: string; parent_id: string | null;
      author_name: string; author_email: string; body: string;
      rating: number | null; status: string; created_at: string;
    }>;

    // Fetch item names + images for display
    const itemIds = [...new Set(rows.map((c) => c.item_id))];
    let itemsMap: Record<string, { name: string; image_url: string | null }> = {};

    if (itemIds.length > 0) {
      const { data: items } = await supabase
        .from('items')
        .select('id, name, image_url')
        .in('id', itemIds) as unknown as { data: Array<{ id: string; name: string; image_url: string | null }> | null };

      if (items) {
        itemsMap = Object.fromEntries(items.map((i) => [i.id, { name: i.name, image_url: i.image_url }]));
      }
    }

    const enriched = rows.map((c) => ({
      ...c,
      item_name: itemsMap[c.item_id]?.name || 'Bilinmeyen Ürün',
      item_image: itemsMap[c.item_id]?.image_url || null,
    }));

    return NextResponse.json({
      comments: enriched,
      total: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
    });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/* ── PATCH: Update comment status or body ────────────────── */

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, bodyText } = body;

    if (!id) {
      return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      updates.status = status;
    }
    if (typeof bodyText === 'string' && bodyText.trim()) {
      updates.body = bodyText.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('comments')
      .update(updates as never)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/* ── DELETE: Remove a comment ────────────────────────────── */

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
