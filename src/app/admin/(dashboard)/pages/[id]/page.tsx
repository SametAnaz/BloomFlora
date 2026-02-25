/**
 * Page Editor Page
 * Edit existing page with page builder
 */

import { notFound } from 'next/navigation';

import { PageBuilder } from '@/components/page-builder';

import { fromBlockConfig } from '@/lib/page-builder/types';
import type { PageData } from '@/lib/page-builder/types';
import { createClient } from '@/lib/supabase/server';
import type { Database, BlockConfig } from '@/lib/supabase/types';

// Force dynamic rendering (uses cookies for Supabase)
export const dynamic = 'force-dynamic';

type PageRow = Database['public']['Tables']['pages']['Row'];

interface PageEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function PageEditorPage({ params }: PageEditorPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !page) {
    notFound();
  }

  // Cast to proper type
  const pageRow = page as unknown as PageRow;

  // Transform database page to PageData
  const seoData = pageRow.seo as { title?: string; description?: string } | null;
  const pageData: PageData = {
    id: pageRow.id,
    title: pageRow.title,
    slug: pageRow.slug,
    status: pageRow.status,
    blocks: (pageRow.blocks || []).map((b: BlockConfig) => fromBlockConfig(b)),
    seo: seoData ? { title: seoData.title, description: seoData.description } : undefined,
  };

  return <PageBuilder initialPage={pageData} />;
}
