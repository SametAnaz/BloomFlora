/**
 * Block Editor Component
 * Renders the config editor for a specific block
 */

'use client';

import { getModule } from '@/modules';
import { deepMerge } from '@/lib/utils';

import type { PageBlock } from '@/lib/page-builder/types';

interface BlockEditorProps {
  block: PageBlock;
  onChange: (config: Record<string, unknown>) => void;
  onClose: () => void;
}

export function BlockEditor({ block, onChange, onClose }: BlockEditorProps) {
  const moduleKey = `${block.moduleId}.${block.version}`;
  const moduleDef = getModule(moduleKey);
  
  if (!moduleDef) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Modül bulunamadı
      </div>
    );
  }

  const EditorComponent = moduleDef.Editor;
  
  // Merge config with defaults to handle missing properties
  const mergedConfig = deepMerge(
    moduleDef.defaultConfig as Record<string, unknown>,
    (block.config || {}) as Record<string, unknown>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="font-semibold">{moduleDef.meta.name}</h3>
          <p className="text-xs text-muted-foreground">Blok ayarlarını düzenleyin</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-accent"
          aria-label="Kapat"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <EditorComponent 
          config={mergedConfig as never} 
          onChange={onChange as (config: unknown) => void}
          blockId={block.id}
        />
      </div>
    </div>
  );
}
