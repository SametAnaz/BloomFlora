/**
 * Dynamic Page Route
 * Renders pages from Supabase by their slug
 * Handles pages created in the admin page builder (e.g. /hakkimizda)
 * Note: /urunler has its own dedicated route, so it's excluded here
 */

import { notFound } from 'next/navigation';

import { PageRenderer, initializeModules } from '@/modules';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

import type { BlockInstance } from '@/modules/types';

export const dynamic = 'force-dynamic';

type PageRow = Database['public']['Tables']['pages']['Row'];

// Slugs that have their own dedicated routes (not handled by this catch-all)
const RESERVED_SLUGS = ['urunler'];

// Ensure modules are initialized
initializeModules();

interface DynamicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DynamicPageProps) {
  const { slug } = await params;

  // Reserved slugs have their own routes with metadata
  if (RESERVED_SLUGS.includes(slug)) return {};

  const supabase = await createClient();

  const { data } = await supabase
    .from('pages')
    .select('title, seo')
    .eq('slug', slug)
    .eq('status', 'published')
    .single() as unknown as { data: { title: string; seo: { title?: string; description?: string } | null } | null };

  if (!data) return { title: 'Sayfa Bulunamadı | Bloom Flora' };

  return {
    title: data.seo?.title || `${data.title} | Bloom Flora`,
    description: data.seo?.description || undefined,
  };
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  const { slug } = await params;

  // Reserved slugs have their own dedicated routes
  if (RESERVED_SLUGS.includes(slug)) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch page by slug
  const { data: pageData, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !pageData) {
    notFound();
  }

  const page = pageData as unknown as PageRow;

  // If this is the homepage slug, redirect to /
  if (page.slug === 'anasayfa') {
    const { redirect } = await import('next/navigation');
    redirect('/');
  }

  const blocks = (page.blocks || []) as BlockInstance[];

  if (blocks.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF6F0]">
        <div className="container-mobile flex flex-col items-center justify-center py-32 text-center">
          <h1 className="text-3xl font-bold text-[#4D1D2A]">{page.title}</h1>
          <p className="mt-4 text-[#8B6F75]">
            Bu sayfa henüz düzenlenmemiş. Admin panelinden içerik ekleyebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  return <PageRenderer blocks={blocks} />;
}
