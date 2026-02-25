/**
 * Pages List Page
 * Admin page to list all pages
 */

import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

// Force dynamic rendering (uses cookies for Supabase)
export const dynamic = 'force-dynamic';

type PageRow = Database['public']['Tables']['pages']['Row'];

export default async function PagesListPage() {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false });

  const pages = (data || []) as unknown as PageRow[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sayfalar</h1>
          <p className="text-sm text-muted-foreground">
            Site sayfalarını yönetin ve düzenleyin
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Sayfa
        </Link>
      </div>

      {/* Pages Table */}
      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                Sayfa Adı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                Oluşturulma
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pages.length > 0 ? (
              pages.map((page) => (
                <tr key={page.id} className="hover:bg-accent/50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{page.title}</div>
                    {page.slug === 'anasayfa' ? (
                      <span className="inline-block mt-1 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        Ana Sayfa
                      </span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    /{page.slug}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        page.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {page.status === 'published' ? 'Yayında' : 'Taslak'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(page.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Düzenle"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Önizle"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Henüz sayfa oluşturulmamış</p>
                    <Link
                      href="/admin/pages/new"
                      className="mt-2 text-sm text-primary hover:underline"
                    >
                      İlk sayfanızı oluşturun →
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
