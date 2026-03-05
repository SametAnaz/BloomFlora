/**
 * Admin Comments Management Page
 * Lists, filters, approves, rejects, edits, and deletes comments
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

/* ── Types ─────────────────────────────────────────────────── */

interface AdminComment {
  id: string;
  item_id: string;
  item_name: string;
  item_image: string | null;
  parent_id: string | null;
  author_name: string;
  author_email: string;
  body: string;
  rating: number | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

type TabStatus = 'all' | 'pending' | 'approved' | 'rejected';

/* ── Helpers ────────────────────────────────────────────────── */

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', label: 'Beklemede' },
  approved: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: 'Onaylı' },
  rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Reddedildi' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ── Parent Thread (shows ancestor comments when clicking Yanıt) ── */

interface AncestorComment {
  id: string;
  parent_id: string | null;
  author_name: string;
  body: string;
  rating: number | null;
  status: string;
  created_at: string;
}

function ParentThread({ commentId }: { commentId: string }) {
  const [ancestors, setAncestors] = useState<AncestorComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/comments?thread_of=${commentId}`);
        const data = await res.json();
        // Remove the last item (it's the current comment itself)
        const chain: AncestorComment[] = data.ancestors || [];
        setAncestors(chain.slice(0, -1));
      } catch {
        console.error('Yorum zinciri yüklenemedi');
      } finally {
        setLoading(false);
      }
    })();
  }, [commentId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#8B3A4A] border-t-transparent" />
        <span className="text-xs text-[#C4959E]">Yükleniyor...</span>
      </div>
    );
  }

  if (ancestors.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#E8D5D0] bg-[#FDFAF8] px-3 py-2 text-xs text-[#C4959E]">
        Ana yorum bulunamadı veya silinmiş.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ancestors.map((a, idx) => {
        const aBadge = statusBadge[a.status] || statusBadge.pending;
        return (
          <div
            key={a.id}
            className="rounded-lg border border-[#E8D5D0] bg-[#FDFAF8] px-3 py-2.5"
            style={{ marginLeft: `${idx * 12}px` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F5E6E8] text-[10px] font-bold text-[#8B3A4A]">
                {a.author_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-[#4D1D2A]">{a.author_name}</span>
              <span className={`inline-flex rounded-full border px-1.5 py-px text-[10px] font-medium ${aBadge.bg} ${aBadge.text}`}>
                {aBadge.label}
              </span>
              {a.rating && (
                <div className="inline-flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className={`h-2.5 w-2.5 ${s <= a.rating! ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              )}
              <span className="text-[10px] text-[#C4959E]">{formatDate(a.created_at)}</span>
            </div>
            <p className="text-xs text-[#5D3A42] leading-relaxed whitespace-pre-line line-clamp-3">
              {a.body}
            </p>
          </div>
        );
      })}
      {/* Arrow indicating the reply */}
      <div className="flex items-center gap-1 pl-2 text-[10px] text-[#C4959E]">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        Bu yoruma yanıt olarak yazıldı
      </div>
    </div>
  );
}

/* ── Stars Display ─────────────────────────────────────────── */

function Stars({ value }: { value: number }) {
  return (
    <div className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i <= value ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

/* ── Edit Modal ────────────────────────────────────────────── */

function EditModal({
  comment,
  onClose,
  onSave,
}: {
  comment: AdminComment;
  onClose: () => void;
  onSave: (id: string, bodyText: string) => void;
}) {
  const [text, setText] = useState(comment.body);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-[#4D1D2A] mb-4">Yorumu Düzenle</h3>
        <div className="mb-3 text-xs text-[#8B6F75]">
          <strong>{comment.author_name}</strong> — {comment.author_email}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-[#E8D5D0] px-3 py-2.5 text-sm text-[#4D1D2A] focus:border-[#8B3A4A] focus:outline-none focus:ring-1 focus:ring-[#8B3A4A]/20"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#E8D5D0] px-4 py-2 text-sm font-medium text-[#8B6F75] hover:border-[#8B3A4A] hover:text-[#4D1D2A]"
          >
            İptal
          </button>
          <button
            onClick={() => onSave(comment.id, text)}
            className="rounded-lg bg-[#8B3A4A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6B2D3D]"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Confirm Modal ──────────────────────────────────── */

function DeleteModal({
  comment,
  onClose,
  onConfirm,
}: {
  comment: AdminComment;
  onClose: () => void;
  onConfirm: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-[#4D1D2A] mb-2">Yorumu Sil</h3>
        <p className="text-sm text-[#8B6F75] mb-1">
          <strong>{comment.author_name}</strong> tarafından yapılan bu yorumu silmek istediğinize emin misiniz?
        </p>
        <p className="text-xs text-[#C4959E] mb-4">
          Bu işlem geri alınamaz. Varsa alt yanıtlar da silinecektir.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#E8D5D0] px-4 py-2 text-sm font-medium text-[#8B6F75] hover:border-[#8B3A4A] hover:text-[#4D1D2A]"
          >
            İptal
          </button>
          <button
            onClick={() => onConfirm(comment.id)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabStatus>('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [editingComment, setEditingComment] = useState<AdminComment | null>(null);
  const [deletingComment, setDeletingComment] = useState<AdminComment | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedThread, setExpandedThread] = useState<string | null>(null);

  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [togglingComments, setTogglingComments] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = tab === 'all' ? '' : `&status=${tab}`;
      const res = await fetch(`/api/admin/comments?page=${page}${statusParam}`);
      const data = await res.json();
      setComments(data.comments || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      console.error('Yorumlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Load comments_enabled setting
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('site_settings')
      .select('key, value')
      .eq('key', 'comments_enabled')
      .single()
      .then(({ data }) => {
        if (data) setCommentsEnabled((data as unknown as { value: boolean }).value);
      });
  }, []);

  const handleToggleComments = async () => {
    setTogglingComments(true);
    const newVal = !commentsEnabled;
    try {
      const supabase = createClient();
      await supabase
        .from('site_settings')
        .upsert(
          { key: 'comments_enabled', value: newVal as never, updated_at: new Date().toISOString() } as never,
          { onConflict: 'key' }
        );
      setCommentsEnabled(newVal);
    } catch {
      console.error('Yorum ayarı kaydedilemedi');
    } finally {
      setTogglingComments(false);
    }
  };

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [tab]);

  /* Actions */
  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    setActionLoading(id);
    try {
      await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      await fetchComments();
    } catch {
      console.error('Durum güncellenemedi');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = async (id: string, bodyText: string) => {
    setActionLoading(id);
    try {
      await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, bodyText }),
      });
      setEditingComment(null);
      await fetchComments();
    } catch {
      console.error('Düzenleme başarısız');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setDeletingComment(null);
      await fetchComments();
    } catch {
      console.error('Silme başarısız');
    } finally {
      setActionLoading(null);
    }
  };

  /* Tabs config */
  const tabs: { key: TabStatus; label: string }[] = [
    { key: 'pending', label: 'Beklemede' },
    { key: 'approved', label: 'Onaylı' },
    { key: 'rejected', label: 'Reddedildi' },
    { key: 'all', label: 'Tümü' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#4D1D2A]">Yorumlar</h1>
          <p className="mt-1 text-sm text-[#8B6F75]">
            Müşteri yorumlarını yönetin, onaylayın veya reddedin.
          </p>
        </div>
        {/* Comments Enable/Disable Toggle */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#E8D5D0] bg-gradient-to-r from-[#FDF6F0] to-white px-5 py-3.5 shadow-sm">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#4D1D2A]">Yorumlar</span>
            <span className="text-xs text-[#8B6F75]">
              {commentsEnabled ? 'Müşteriler yorum yapabilir' : 'Yorumlar gizli'}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={commentsEnabled}
            onClick={handleToggleComments}
            disabled={togglingComments}
            className={`relative ml-2 flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#8B3A4A]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
              commentsEnabled
                ? 'bg-[#8B3A4A] shadow-[0_2px_8px_rgba(139,58,74,0.3)]'
                : 'bg-[#DDD0D3]'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 ${
                commentsEnabled ? 'translate-x-7' : 'translate-x-0'
              }`}
            >
              {togglingComments ? (
                <svg className="h-2.5 w-2.5 animate-spin text-[#8B3A4A]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : commentsEnabled ? (
                <svg className="h-2.5 w-2.5 text-[#8B3A4A]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-2.5 w-2.5 text-[#C4959E]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </span>
          </button>
          <span className={`w-12 text-xs font-bold ${commentsEnabled ? 'text-[#8B3A4A]' : 'text-[#C4959E]'}`}>
            {commentsEnabled ? 'Açık' : 'Kapalı'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-[#F5E6E8]/60 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-white text-[#4D1D2A] shadow-sm'
                : 'text-[#8B6F75] hover:text-[#4D1D2A]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="text-sm text-[#8B6F75]">
        Toplam <strong className="text-[#4D1D2A]">{total}</strong> yorum
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B3A4A] border-t-transparent" />
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-[#E8D5D0] bg-[#FDFAF8] px-6 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-[#E8D5D0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="mt-3 font-medium text-[#4D1D2A]">Bu kategoride yorum yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => {
            const badge = statusBadge[c.status];
            const isLoading = actionLoading === c.id;

            return (
              <div
                key={c.id}
                className={`rounded-xl border bg-white p-4 transition-opacity ${
                  isLoading ? 'opacity-50 pointer-events-none' : ''
                } ${c.status === 'pending' ? 'border-yellow-200' : 'border-[#E8D5D0]'}`}
              >
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Avatar */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5E6E8] text-sm font-bold text-[#8B3A4A]">
                      {c.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#4D1D2A]">{c.author_name}</span>
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                        {c.parent_id && (
                          <button
                            type="button"
                            onClick={() => setExpandedThread(expandedThread === c.id ? null : c.id)}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors ${
                              expandedThread === c.id
                                ? 'border-[#8B3A4A] bg-[#F5E6E8] text-[#8B3A4A]'
                                : 'border-[#E8D5D0] text-[#C4959E] hover:border-[#8B3A4A] hover:text-[#8B3A4A]'
                            }`}
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Yanıt
                            <svg className={`h-3 w-3 transition-transform ${expandedThread === c.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#C4959E]">
                        <span>{c.author_email}</span>
                        <span>·</span>
                        <span>{formatDate(c.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  {c.rating && <Stars value={c.rating} />}
                </div>

                {/* Parent thread (expandable) */}
                {c.parent_id && expandedThread === c.id && (
                  <div className="mb-3 rounded-lg border border-[#E8D5D0] bg-[#FDFAF8]/60 p-3">
                    <ParentThread commentId={c.id} />
                  </div>
                )}

                {/* Item name with image preview on hover */}
                <div className="mb-2">
                  <span className="group relative inline-flex items-center gap-1 rounded-md bg-[#F5E6E8]/60 px-2 py-0.5 text-xs font-medium text-[#8B3A4A] cursor-default">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {c.item_name}
                    {/* Hover tooltip */}
                    {c.item_image && (
                      <span className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden rounded-xl border border-[#E8D5D0] bg-white p-1.5 shadow-lg group-hover:block">
                        <img
                          src={c.item_image}
                          alt={c.item_name}
                          className="h-28 w-28 rounded-lg object-cover"
                        />
                        <span className="mt-1 block max-w-[112px] truncate text-center text-[10px] font-semibold text-[#4D1D2A]">
                          {c.item_name}
                        </span>
                      </span>
                    )}
                  </span>
                </div>

                {/* Body */}
                <p className="text-sm text-[#5D3A42] whitespace-pre-line leading-relaxed mb-3">
                  {c.body}
                </p>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  {c.status !== 'approved' && (
                    <button
                      onClick={() => handleStatusChange(c.id, 'approved')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Onayla
                    </button>
                  )}
                  {c.status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusChange(c.id, 'rejected')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reddet
                    </button>
                  )}
                  {c.status !== 'pending' && (
                    <button
                      onClick={() => handleStatusChange(c.id, 'pending')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-100 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Beklemeye Al
                    </button>
                  )}
                  <button
                    onClick={() => setEditingComment(c)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#F5E6E8]/60 border border-[#E8D5D0] px-3 py-1.5 text-xs font-medium text-[#8B3A4A] hover:bg-[#F5E6E8] transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Düzenle
                  </button>
                  <button
                    onClick={() => setDeletingComment(c)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-[#E8D5D0] px-3 py-2 text-sm font-medium text-[#8B6F75] hover:border-[#8B3A4A] hover:text-[#4D1D2A] disabled:opacity-40 disabled:pointer-events-none"
          >
            ← Önceki
          </button>
          <span className="text-sm text-[#8B6F75]">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-[#E8D5D0] px-3 py-2 text-sm font-medium text-[#8B6F75] hover:border-[#8B3A4A] hover:text-[#4D1D2A] disabled:opacity-40 disabled:pointer-events-none"
          >
            Sonraki →
          </button>
        </div>
      )}

      {/* Modals */}
      {editingComment && (
        <EditModal
          comment={editingComment}
          onClose={() => setEditingComment(null)}
          onSave={handleEdit}
        />
      )}
      {deletingComment && (
        <DeleteModal
          comment={deletingComment}
          onClose={() => setDeletingComment(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
