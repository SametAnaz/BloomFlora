/**
 * Block Canvas Component
 * Visual editor for arranging blocks with drag and drop
 */

'use client';

import { useState } from 'react';

import { BlockRenderer } from '@/modules';

import type { PageBlock } from '@/lib/page-builder/types';

import type { BlockInstance } from '@/modules/types';

interface BlockCanvasProps {
  blocks: PageBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
  onDeleteBlock: (id: string) => void;
  onLoadDefaults?: () => void;
}

// Convert PageBlock to BlockInstance for renderer
function toBlockInstance(block: PageBlock): BlockInstance {
  return {
    id: block.id,
    type: `${block.moduleId}.${block.version}`,
    order: block.order,
    enabled: true,
    config: block.config,
  };
}

export function BlockCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onMoveBlock,
  onDeleteBlock,
  onLoadDefaults,
}: BlockCanvasProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      onMoveBlock(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (blocks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="mt-4 text-lg font-medium">Sayfa boş</p>
          <p className="text-sm">Sol panelden blok ekleyerek başlayın</p>
          {onLoadDefaults && (
            <button
              onClick={onLoadDefaults}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Varsayılan İçeriği Yükle
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {blocks.map((block, index) => (
        <div
          key={block.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            group relative rounded-lg border-2 transition-all
            ${selectedBlockId === block.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'}
            ${draggedIndex === index ? 'opacity-50' : ''}
            ${dragOverIndex === index && draggedIndex !== index ? 'border-primary border-dashed' : ''}
          `}
        >
          {/* Block Controls */}
          <div
            className={`
              absolute -top-3 left-4 z-10 flex items-center gap-1 rounded-md border bg-background px-2 py-1 shadow-sm
              ${selectedBlockId === block.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
              transition-opacity
            `}
          >
            {/* Drag Handle */}
            <button
              className="cursor-grab p-1 text-muted-foreground hover:text-foreground"
              title="Sürükle"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </button>

            {/* Move Up */}
            <button
              onClick={() => index > 0 && onMoveBlock(index, index - 1)}
              disabled={index === 0}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              title="Yukarı taşı"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>

            {/* Move Down */}
            <button
              onClick={() => index < blocks.length - 1 && onMoveBlock(index, index + 1)}
              disabled={index === blocks.length - 1}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              title="Aşağı taşı"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Edit */}
            <button
              onClick={() => onSelectBlock(block.id)}
              className="p-1 text-muted-foreground hover:text-foreground"
              title="Düzenle"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            {/* Delete */}
            <button
              onClick={() => onDeleteBlock(block.id)}
              className="p-1 text-destructive hover:text-destructive"
              title="Sil"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Block Preview */}
          <div
            onClick={() => onSelectBlock(block.id)}
            className="cursor-pointer rounded-lg"
          >
            <BlockRenderer
              block={toBlockInstance(block)}
              isPreview
            />
          </div>
        </div>
      ))}
    </div>
  );
}
