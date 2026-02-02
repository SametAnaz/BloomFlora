/**
 * Module System Type Definitions
 * Core types for the page builder module system
 */

import type { ComponentType, ReactNode } from 'react';

import { z } from 'zod';

// =====================================================
// Base Module Types
// =====================================================

/**
 * Module metadata - describes what the module is and how it behaves
 */
export interface ModuleMeta {
  /** Unique identifier in format: moduleName.version (e.g., 'hero.v1') */
  id: string;
  /** Human-readable name for admin UI */
  name: string;
  /** Description shown in module picker */
  description: string;
  /** Category for grouping in admin UI */
  category: ModuleCategory;
  /** Icon name (lucide-react icon) */
  icon: string;
  /** Module version */
  version: string;
  /** Preview image URL for module picker */
  previewImage?: string;
  /** Tags for search/filter */
  tags?: string[];
}

/**
 * Module categories for organization in admin UI
 */
export type ModuleCategory =
  | 'hero'
  | 'content'
  | 'media'
  | 'navigation'
  | 'contact'
  | 'catalog'
  | 'social'
  | 'utility';

/**
 * Visibility settings for responsive design
 */
export interface ModuleVisibility {
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
}

/**
 * Block instance stored in database
 */
export interface BlockInstance<TConfig = unknown> {
  /** Unique instance ID (UUID) */
  id: string;
  /** Module type ID (e.g., 'hero.v1') */
  type: string;
  /** Display order on page */
  order: number;
  /** Whether block is enabled */
  enabled: boolean;
  /** Module-specific configuration */
  config: TConfig;
  /** Responsive visibility settings */
  visibility?: ModuleVisibility;
}

// =====================================================
// Module Definition Types
// =====================================================

/**
 * Props passed to module render component
 */
export interface ModuleRenderProps<TConfig = unknown> {
  /** Block instance data */
  block: BlockInstance<TConfig>;
  /** Whether in preview mode (admin) */
  isPreview?: boolean;
  /** Whether in edit mode (admin) */
  isEditing?: boolean;
}

/**
 * Props passed to module editor component
 */
export interface ModuleEditorProps<TConfig = unknown> {
  /** Current configuration */
  config: TConfig;
  /** Callback when config changes */
  onChange: (config: TConfig) => void;
  /** Block instance ID */
  blockId: string;
}

/**
 * Complete module definition
 */
export interface ModuleDefinition<TConfig = unknown> {
  /** Module metadata */
  meta: ModuleMeta;
  /** Zod schema for config validation */
  configSchema: z.ZodType<TConfig>;
  /** Default configuration */
  defaultConfig: TConfig;
  /** Render component for public site */
  Render: ComponentType<ModuleRenderProps<TConfig>>;
  /** Editor component for admin panel */
  Editor: ComponentType<ModuleEditorProps<TConfig>>;
  /** Optional: Generate preview thumbnail */
  generatePreview?: (config: TConfig) => ReactNode;
}

// =====================================================
// Common Config Field Types
// =====================================================

/**
 * Rich text content (HTML string)
 */
export type RichTextContent = string;

/**
 * Image reference
 */
export interface ImageRef {
  /** Image URL (Supabase Storage or external) */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Optional width */
  width?: number;
  /** Optional height */
  height?: number;
}

/**
 * Link/CTA configuration
 */
export interface LinkConfig {
  /** Link text */
  text: string;
  /** Link URL (internal or external) */
  href: string;
  /** Open in new tab */
  newTab?: boolean;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
}

/**
 * Spacing configuration
 */
export interface SpacingConfig {
  /** Top padding */
  paddingTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Bottom padding */
  paddingBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Background configuration
 */
export interface BackgroundConfig {
  /** Background type */
  type: 'none' | 'color' | 'image' | 'gradient';
  /** Background color (CSS value) */
  color?: string;
  /** Background image */
  image?: ImageRef;
  /** Gradient CSS value */
  gradient?: string;
  /** Overlay opacity (0-100) */
  overlayOpacity?: number;
}

// =====================================================
// Zod Schemas for Common Types
// =====================================================

export const imageRefSchema = z.object({
  src: z.string().url().or(z.string().startsWith('/')),
  alt: z.string(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

export const linkConfigSchema = z.object({
  text: z.string().min(1),
  href: z.string().min(1),
  newTab: z.boolean().optional(),
  variant: z
    .enum(['primary', 'secondary', 'outline', 'ghost', 'link'])
    .optional(),
});

export const spacingConfigSchema = z.object({
  paddingTop: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
  paddingBottom: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
});

export const backgroundConfigSchema = z.object({
  type: z.enum(['none', 'color', 'image', 'gradient']),
  color: z.string().optional(),
  image: imageRefSchema.optional(),
  gradient: z.string().optional(),
  overlayOpacity: z.number().min(0).max(100).optional(),
});

export const moduleVisibilitySchema = z.object({
  hideOnMobile: z.boolean().optional(),
  hideOnDesktop: z.boolean().optional(),
});

// =====================================================
// Block Instance Schema
// =====================================================

export const blockInstanceSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1),
  order: z.number().int().nonnegative(),
  enabled: z.boolean(),
  config: z.record(z.string(), z.unknown()),
  visibility: moduleVisibilitySchema.optional(),
});

// =====================================================
// Utility Types
// =====================================================

/**
 * Extract config type from module definition
 */
export type ModuleConfig<T extends ModuleDefinition> =
  T extends ModuleDefinition<infer C> ? C : never;

/**
 * Type-safe block instance for a specific module
 */
export type TypedBlockInstance<T extends ModuleDefinition> = BlockInstance<
  ModuleConfig<T>
>;
