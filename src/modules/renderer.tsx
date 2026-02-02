/**
 * Block Renderer
 * Renders page blocks based on their module type
 */

'use client';

import { memo, useMemo } from 'react';

import { deepMerge } from '@/lib/utils';

import { initializeModules } from './loader';
import { getModule } from './registry';

import type { BlockInstance, ModuleVisibility } from './types';

// Initialize modules on client side
initializeModules();

// =====================================================
// Visibility Helper
// =====================================================

/**
 * Check if block should be visible based on visibility settings
 * and current viewport
 */
function useBlockVisibility(visibility?: ModuleVisibility): {
  className: string;
} {
  const className = useMemo(() => {
    if (!visibility) return '';

    const classes: string[] = [];

    if (visibility.hideOnMobile) {
      classes.push('hidden md:block');
    }

    if (visibility.hideOnDesktop) {
      classes.push('md:hidden');
    }

    return classes.join(' ');
  }, [visibility]);

  return { className };
}

// =====================================================
// Block Renderer Component
// =====================================================

interface BlockRendererProps {
  /** Block instance to render */
  block: BlockInstance;
  /** Whether in preview mode (admin) */
  isPreview?: boolean;
  /** Whether in edit mode (admin) */
  isEditing?: boolean;
}

/**
 * Renders a single block using its registered module
 */
function BlockRendererInner({
  block,
  isPreview = false,
  isEditing = false,
}: BlockRendererProps) {
  const moduleDef = getModule(block.type);
  const { className: visibilityClass } = useBlockVisibility(block.visibility);

  // Module not found
  if (!moduleDef) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="border-2 border-dashed border-destructive bg-destructive/10 p-4 text-center text-destructive">
          <p className="font-medium">Module not found: {block.type}</p>
          <p className="text-sm">
            Make sure the module is registered in the loader.
          </p>
        </div>
      );
    }
    return null;
  }

  // Block disabled
  if (!block.enabled && !isPreview) {
    return null;
  }

  const { Render } = moduleDef;

  // Deep merge config with defaults to handle missing nested properties
  const mergedConfig = deepMerge(
    moduleDef.defaultConfig as Record<string, unknown>,
    (block.config || {}) as Record<string, unknown>
  );
  const blockWithMergedConfig = { ...block, config: mergedConfig };

  return (
    <div
      className={`block-wrapper ${visibilityClass} ${!block.enabled ? 'opacity-50' : ''}`}
      data-block-id={block.id}
      data-block-type={block.type}
    >
      <Render block={blockWithMergedConfig} isPreview={isPreview} isEditing={isEditing} />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const BlockRenderer = memo(BlockRendererInner);

// =====================================================
// Page Renderer Component
// =====================================================

interface PageRendererProps {
  /** Array of blocks to render */
  blocks: BlockInstance[];
  /** Whether in preview mode */
  isPreview?: boolean;
}

/**
 * Renders a full page from an array of blocks
 */
export function PageRenderer({ blocks, isPreview = false }: PageRendererProps) {
  // Sort blocks by order
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks]
  );

  if (sortedBlocks.length === 0) {
    if (isPreview) {
      return (
        <div className="flex min-h-[200px] items-center justify-center border-2 border-dashed border-muted-foreground/30 text-muted-foreground">
          <p>Bu sayfa henüz boş. Modül eklemek için sürükle-bırak yapın.</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="page-content">
      {sortedBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} isPreview={isPreview} />
      ))}
    </div>
  );
}
