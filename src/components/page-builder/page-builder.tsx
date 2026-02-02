/**
 * Page Builder Component
 * Main page builder interface with blocks, editor and preview
 */

'use client';

import { useState, useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { toBlockConfig } from '@/lib/page-builder/types';
import type { PageBlock, PageData } from '@/lib/page-builder/types';
import { createClient } from '@/lib/supabase/client';


import { BlockCanvas } from './block-canvas';
import { BlockEditor } from './block-editor';
import { BlockList } from './block-list';

interface PageBuilderProps {
  initialPage: PageData;
}

export function PageBuilder({ initialPage }: PageBuilderProps) {
  const router = useRouter();
  const [page, setPage] = useState<PageData>(initialPage);
  const [blocks, setBlocks] = useState<PageBlock[]>(initialPage.blocks || []);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  // Add a new block
  const handleAddBlock = useCallback((moduleId: string, version: string) => {
    const newBlock: PageBlock = {
      id: crypto.randomUUID(),
      moduleId,
      version,
      config: getDefaultConfig(moduleId),
      order: blocks.length,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    setHasChanges(true);
  }, [blocks.length]);

  // Update block config
  const handleBlockConfigChange = useCallback((config: Record<string, unknown>) => {
    if (!selectedBlockId) return;
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === selectedBlockId ? { ...block, config } : block
      )
    );
    setHasChanges(true);
  }, [selectedBlockId]);

  // Move block
  const handleMoveBlock = useCallback((fromIndex: number, toIndex: number) => {
    setBlocks((prev) => {
      const newBlocks = [...prev];
      const [movedBlock] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, movedBlock);
      return newBlocks.map((block, index) => ({ ...block, order: index }));
    });
    setHasChanges(true);
  }, []);

  // Delete block
  const handleDeleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
    setHasChanges(true);
  }, [selectedBlockId]);

  // Save page
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const updateData = {
        title: page.title,
        slug: page.slug,
        status: page.status,
        blocks: blocks.map(toBlockConfig),
        seo_title: page.seo_title,
        seo_description: page.seo_description,
        updated_at: new Date().toISOString(),
      };
      
      console.log('=== SAVE DEBUG ===');
      console.log('Page ID:', page.id);
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      
      const { data, error, count } = await supabase
        .from('pages')
        .update(updateData as never)
        .eq('id', page.id)
        .select();

      console.log('Supabase response:', { data, error, count });
      
      if (error) {
        console.error('Supabase error details:', error);
        alert('Kaydetme hatası: ' + error.message);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('No rows updated! Page ID may not exist in database.');
        alert('Uyarı: Veritabanında bu sayfa bulunamadı. Page ID: ' + page.id);
      } else {
        console.log('Successfully updated:', data);
        alert('Başarıyla kaydedildi!');
      }
      
      setHasChanges(false);
    } catch (error) {
      console.error('Save error:', error);
      alert('Kaydetme hatası: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  // Publish/Unpublish
  const handleTogglePublish = async () => {
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    setPage((prev) => ({ ...prev, status: newStatus }));
    
    const supabase = createClient();
    const statusUpdate = { status: newStatus, updated_at: new Date().toISOString() };
    await supabase
      .from('pages')
      .update(statusUpdate as never)
      .eq('id', page.id);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/pages')}
            className="rounded-md p-2 hover:bg-accent"
            title="Geri dön"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <input
            type="text"
            value={page.title}
            onChange={(e) => {
              setPage((prev) => ({ ...prev, title: e.target.value }));
              setHasChanges(true);
            }}
            className="border-0 bg-transparent text-lg font-semibold focus:outline-none focus:ring-0"
            placeholder="Sayfa başlığı"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              page.status === 'published'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}
          >
            {page.status === 'published' ? 'Yayında' : 'Taslak'}
          </span>

          {/* Unsaved Changes Indicator */}
          {hasChanges ? (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Kaydedilmemiş değişiklikler
            </span>
          ) : null}

          {/* Publish/Unpublish Button */}
          <button
            onClick={handleTogglePublish}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            {page.status === 'published' ? 'Yayından Kaldır' : 'Yayınla'}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Block List */}
        <div className="w-64 shrink-0 overflow-y-auto border-r bg-muted/30">
          <BlockList onAddBlock={handleAddBlock} />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-y-auto bg-muted/50">
          <BlockCanvas
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onMoveBlock={handleMoveBlock}
            onDeleteBlock={handleDeleteBlock}
          />
        </div>

        {/* Right Panel - Block Editor */}
        {selectedBlock ? (
          <div className="w-80 shrink-0 overflow-hidden border-l bg-background">
            <BlockEditor
              block={selectedBlock}
              onChange={handleBlockConfigChange}
              onClose={() => setSelectedBlockId(null)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Default configs for each module type
function getDefaultConfig(moduleId: string): Record<string, unknown> {
  switch (moduleId) {
    case 'hero':
      return {
        title: 'Yeni Hero Başlığı',
        subtitle: 'Alt başlık ekleyin',
        backgroundType: 'color',
        backgroundColor: '#1a1a2e',
        ctaText: 'Keşfedin',
        ctaLink: '#',
        alignment: 'center',
      };
    case 'richText':
      return {
        content: '<p>İçeriğinizi buraya yazın...</p>',
        maxWidth: 'prose',
      };
    case 'imageGallery':
      return {
        images: [],
        columns: 3,
        gap: 'md',
        aspectRatio: 'square',
      };
    case 'contactForm':
      return {
        title: 'İletişim',
        description: 'Bizimle iletişime geçin',
        fields: ['name', 'email', 'message'],
        submitText: 'Gönder',
      };
    default:
      return {};
  }
}
