/**
 * Comments API — Public endpoints
 *
 * GET  /api/comments?item_id=xxx  → approved comments for a product (tree)
 * POST /api/comments               → submit new comment (pending)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* ── Helpers ───────────────────────────────────────────────── */

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ── GET: Approved comments for an item ──────────────────── */

export async function GET(request: NextRequest) {
  const itemId = request.nextUrl.searchParams.get('item_id');
  if (!itemId) {
    return NextResponse.json({ error: 'item_id gerekli' }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('comments')
      .select('id, item_id, parent_id, author_name, body, rating, created_at')
      .eq('item_id', itemId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comments: data || [] });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

/* ── POST: Submit a new comment ──────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_id, parent_id, author_name, author_email, text, rating } = body;

    // Validation
    if (!item_id || !author_name?.trim() || !author_email?.trim() || !text?.trim()) {
      return NextResponse.json(
        { error: 'Tüm alanlar doldurulmalıdır.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(author_email.trim())) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    if (text.trim().length < 3) {
      return NextResponse.json(
        { error: 'Yorum en az 3 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    if (text.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Yorum en fazla 2000 karakter olabilir.' },
        { status: 400 }
      );
    }

    // Rating only for top-level comments (no parent)
    const parsedRating = !parent_id && rating ? Math.min(5, Math.max(1, Math.round(Number(rating)))) : null;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('comments')
      .insert({
        item_id,
        parent_id: parent_id || null,
        author_name: author_name.trim(),
        author_email: author_email.trim().toLowerCase(),
        body: text.trim(),
        rating: parsedRating,
        status: 'pending',
      } as never)
      .select('id')
      .single() as unknown as { data: { id: string } | null; error: { message: string } | null };

    if (error) {
      console.error('[Comments API] Insert error:', error);
      return NextResponse.json({ error: 'Yorum gönderilemedi.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Yorumunuz gönderildi. Onaylandıktan sonra görünecektir.',
      id: data?.id,
    });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
