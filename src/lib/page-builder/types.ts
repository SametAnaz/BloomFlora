/**
 * Block Types for Page Builder
 * Defines the block structure used in page composition
 */

// Page block as used in the page builder UI
export interface PageBlock {
  id: string;
  moduleId: string;
  version: string;
  config: Record<string, unknown>;
  order: number;
}

// Convert PageBlock to database BlockConfig format
export function toBlockConfig(block: PageBlock) {
  return {
    id: block.id,
    type: `${block.moduleId}.${block.version}`,
    order: block.order,
    enabled: true,
    config: block.config,
  };
}

// Convert database BlockConfig to PageBlock format
export function fromBlockConfig(config: {
  id: string;
  type: string;
  order: number;
  config: Record<string, unknown>;
}): PageBlock {
  const [moduleId, version] = config.type.split('.');
  return {
    id: config.id,
    moduleId,
    version,
    config: config.config,
    order: config.order,
  };
}

export interface PageData {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  blocks: PageBlock[];
  seo?: { title?: string; description?: string };
}
