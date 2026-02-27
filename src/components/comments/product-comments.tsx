/**
 * ProductComments — Public comment section for product detail pages
 * Features: nested replies, star rating, email validation, consent checkbox
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Turnstile } from '@/components/turnstile';

/* ── Types ─────────────────────────────────────────────────── */

interface CommentData {
  id: string;
  item_id: string;
  parent_id: string | null;
  author_name: string;
  body: string;
  rating: number | null;
  created_at: string;
  children?: CommentData[];
}

/* ── Helpers ────────────────────────────────────────────────── */

function buildTree(flat: CommentData[]): CommentData[] {
  const map = new Map<string, CommentData>();
  const roots: CommentData[] = [];

  for (const c of flat) {
    map.set(c.id, { ...c, children: [] });
  }

  for (const c of flat) {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;
  const months = Math.floor(days / 30);
  return `${months} ay önce`;
}

function avatarInitial(name: string): string {
  return (name || '?').charAt(0).toUpperCase();
}

/* ── Star Rating Input ─────────────────────────────────────── */

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
}) {
  const cls = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <div className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(i)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <svg
            className={`${cls} ${i <= value ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ── Comment Form ──────────────────────────────────────────── */

function CommentForm({
  itemId,
  parentId,
  onSuccess,
  onCancel,
  compact = false,
}: {
  itemId: string;
  parentId?: string | null;
  onSuccess: () => void;
  onCancel?: () => void;
  compact?: boolean;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const isReply = !!parentId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !text.trim()) {
      setError('Tüm alanlar doldurulmalıdır.');
      return;
    }
    if (!consent) {
      setError('Devam etmek için onay kutusunu işaretlemelisiniz.');
      return;
    }
    if (!turnstileToken) {
      setError('Lütfen bot doğrulamasını tamamlayın.');
      return;
    }

    setSubmitting(true);

    try {
      // Verify turnstile token on server
      const verifyRes = await fetch('/api/turnstile/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setError('Bot doğrulama başarısız. Sayfayı yenileyip tekrar deneyin.');
        setTurnstileToken(null);
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          parent_id: parentId || null,
          author_name: name.trim(),
          author_email: email.trim(),
          text: text.trim(),
          rating: isReply ? null : rating || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Bir hata oluştu.');
        return;
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setText('');
      setRating(0);
      setConsent(false);
      setTurnstileToken(null);
      onSuccess();
    } catch {
      setError('Bağlantı hatası.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={`rounded-xl border border-green-200 bg-green-50 px-4 py-3 ${compact ? '' : 'mb-6'}`}>
        <p className="text-sm font-medium text-green-700">
          ✓ Yorumunuz başarıyla gönderildi! Onaylandıktan sonra görünecektir.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-1 text-xs text-green-600 underline hover:text-green-800"
        >
          Yeni yorum yaz
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${compact ? '' : 'mb-8'}`}>
      {!compact && !isReply && (
        <h3 className="text-lg font-semibold text-[#4D1D2A]">Yorum Yaz</h3>
      )}

      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Adınız *"
          maxLength={80}
          className="rounded-lg border border-[#E8D5D0] bg-white px-3 py-2.5 text-sm text-[#4D1D2A] placeholder:text-[#C4959E] focus:border-[#8B3A4A] focus:outline-none focus:ring-1 focus:ring-[#8B3A4A]/20"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresiniz *"
          maxLength={120}
          className="rounded-lg border border-[#E8D5D0] bg-white px-3 py-2.5 text-sm text-[#4D1D2A] placeholder:text-[#C4959E] focus:border-[#8B3A4A] focus:outline-none focus:ring-1 focus:ring-[#8B3A4A]/20"
        />
      </div>

      {/* Star rating — only for top-level comments */}
      {!isReply && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#8B6F75]">Puanınız:</span>
          <StarRating value={rating} onChange={setRating} />
          {rating > 0 && (
            <button
              type="button"
              onClick={() => setRating(0)}
              className="text-xs text-[#C4959E] hover:text-[#8B3A4A]"
            >
              Kaldır
            </button>
          )}
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isReply ? 'Yanıtınızı yazın...' : 'Yorumunuzu yazın... *'}
        rows={compact ? 2 : 4}
        maxLength={2000}
        className="w-full resize-none rounded-lg border border-[#E8D5D0] bg-white px-3 py-2.5 text-sm text-[#4D1D2A] placeholder:text-[#C4959E] focus:border-[#8B3A4A] focus:outline-none focus:ring-1 focus:ring-[#8B3A4A]/20"
      />

      {/* Consent checkbox */}
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#8B3A4A] rounded"
        />
        <span className="text-xs leading-relaxed text-[#8B6F75]">
          Yorumumu okudum ve göndermeyi onaylıyorum. E-posta adresim yayınlanmayacaktır.
        </span>
      </label>

      {/* Cloudflare Turnstile */}
      <Turnstile
        onVerify={handleTurnstileVerify}
        onExpire={handleTurnstileExpire}
        onError={() => setTurnstileToken(null)}
        theme="light"
        size={compact ? 'compact' : 'normal'}
      />

      {error && (
        <p className="text-sm font-medium text-red-500">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting || !turnstileToken}
          className="rounded-lg bg-[#8B3A4A] px-5 py-2.5 text-sm font-semibold text-white shadow transition-colors hover:bg-[#6B2D3D] disabled:opacity-50"
        >
          {submitting ? 'Gönderiliyor...' : isReply ? 'Yanıtla' : 'Yorum Gönder'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#E8D5D0] px-4 py-2.5 text-sm font-medium text-[#8B6F75] hover:border-[#8B3A4A] hover:text-[#4D1D2A]"
          >
            İptal
          </button>
        )}
      </div>
    </form>
  );
}

/* ── Single Comment ────────────────────────────────────────── */

function CommentItem({
  comment,
  itemId,
  depth,
  onRefresh,
}: {
  comment: CommentData;
  itemId: string;
  depth: number;
  onRefresh: () => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const maxDepth = 3;

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-[#E8D5D0] pl-4' : ''}`}>
      <div className="flex gap-3 py-3">
        {/* Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5E6E8] text-sm font-bold text-[#8B3A4A]">
          {avatarInitial(comment.author_name)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[#4D1D2A]">{comment.author_name}</span>
            <span className="text-xs text-[#C4959E]">{timeAgo(comment.created_at)}</span>
            {comment.rating && (
              <StarRating value={comment.rating} readonly size="sm" />
            )}
          </div>

          {/* Body */}
          <p className="mt-1 text-sm leading-relaxed text-[#5D3A42] whitespace-pre-line">
            {comment.body}
          </p>

          {/* Reply button */}
          {depth < maxDepth && (
            <button
              type="button"
              onClick={() => setShowReply(!showReply)}
              className="mt-1.5 text-xs font-medium text-[#8B3A4A] hover:underline"
            >
              {showReply ? 'İptal' : 'Yanıtla'}
            </button>
          )}

          {/* Reply form */}
          {showReply && (
            <div className="mt-3">
              <CommentForm
                itemId={itemId}
                parentId={comment.id}
                compact
                onSuccess={() => {
                  setShowReply(false);
                  onRefresh();
                }}
                onCancel={() => setShowReply(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {comment.children && comment.children.length > 0 && (
        <div>
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              itemId={itemId}
              depth={depth + 1}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────── */

export function ProductComments({ itemId }: { itemId: string }) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?item_id=${itemId}`);
      const data = await res.json();
      if (data.comments) {
        setComments(buildTree(data.comments));
      }
    } catch {
      console.error('Yorumlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Aggregate rating
  const rated = comments.filter((c) => c.rating);
  const avgRating = rated.length > 0
    ? rated.reduce((s, c) => s + (c.rating || 0), 0) / rated.length
    : 0;

  return (
    <section className="border-t border-[#E8D5D0] bg-white py-12">
      <div className="container-mobile">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#4D1D2A]">Müşteri Yorumları</h2>
            {rated.length > 0 && (
              <div className="mt-1 flex items-center gap-2">
                <StarRating value={Math.round(avgRating)} readonly size="sm" />
                <span className="text-sm text-[#8B6F75]">
                  {avgRating.toFixed(1)} / 5 ({rated.length} değerlendirme)
                </span>
              </div>
            )}
          </div>
          <span className="text-sm text-[#C4959E]">
            {loading ? '' : `${comments.length} yorum`}
          </span>
        </div>

        {/* Comment Form */}
        <CommentForm itemId={itemId} onSuccess={fetchComments} />

        {/* Comments List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#8B3A4A] border-t-transparent" />
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-xl border border-[#E8D5D0] bg-[#FDFAF8] px-6 py-10 text-center">
            <p className="font-medium text-[#4D1D2A]">Henüz yorum yapılmamış</p>
            <p className="mt-1 text-sm text-[#8B6F75]">Bu ürün hakkında ilk yorumu siz yapın!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8D5D0]">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                itemId={itemId}
                depth={0}
                onRefresh={fetchComments}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
