/**
 * Module Registry
 * Central registry for all page builder modules
 */

import type { ModuleDefinition, ModuleCategory, ModuleMeta } from './types';

// =====================================================
// Module Registry Implementation
// =====================================================

// Store all registered modules
const moduleRegistry = new Map<string, ModuleDefinition>();

/**
 * Register a module in the registry
 * @param module - Module definition to register
 * @throws Error if module with same ID already exists
 */
export function registerModule<TConfig>(
  module: ModuleDefinition<TConfig>
): void {
  const { id } = module.meta;

  if (moduleRegistry.has(id)) {
    console.warn(`Module "${id}" is already registered. Skipping.`);
    return;
  }

  moduleRegistry.set(id, module as ModuleDefinition);
}

/**
 * Get a module by its ID
 * @param id - Module ID (e.g., 'hero.v1')
 * @returns Module definition or undefined
 */
export function getModule(id: string): ModuleDefinition | undefined {
  return moduleRegistry.get(id);
}

/**
 * Get a module by its ID, with type assertion
 * @param id - Module ID
 * @returns Module definition
 * @throws Error if module not found
 */
export function getModuleOrThrow(id: string): ModuleDefinition {
  const moduleDef = moduleRegistry.get(id);
  if (!moduleDef) {
    throw new Error(`Module "${id}" not found in registry`);
  }
  return moduleDef;
}

/**
 * Check if a module exists
 * @param id - Module ID
 */
export function hasModule(id: string): boolean {
  return moduleRegistry.has(id);
}

/**
 * Get all registered modules
 */
export function getAllModules(): ModuleDefinition[] {
  return Array.from(moduleRegistry.values());
}

/**
 * Get all module metadata (lighter than full definitions)
 */
export function getAllModuleMeta(): ModuleMeta[] {
  return getAllModules().map((m) => m.meta);
}

/**
 * Get modules by category
 * @param category - Module category to filter by
 */
export function getModulesByCategory(
  category: ModuleCategory
): ModuleDefinition[] {
  return getAllModules().filter((m) => m.meta.category === category);
}

/**
 * Get modules by tags
 * @param tags - Tags to filter by (OR logic)
 */
export function getModulesByTags(tags: string[]): ModuleDefinition[] {
  return getAllModules().filter((m) =>
    m.meta.tags?.some((t) => tags.includes(t))
  );
}

/**
 * Search modules by name or description
 * @param query - Search query
 */
export function searchModules(query: string): ModuleDefinition[] {
  const lowerQuery = query.toLowerCase();
  return getAllModules().filter(
    (m) =>
      m.meta.name.toLowerCase().includes(lowerQuery) ||
      m.meta.description.toLowerCase().includes(lowerQuery) ||
      m.meta.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get grouped modules by category
 */
export function getModulesGroupedByCategory(): Record<
  ModuleCategory,
  ModuleDefinition[]
> {
  const grouped: Record<ModuleCategory, ModuleDefinition[]> = {
    hero: [],
    content: [],
    media: [],
    navigation: [],
    contact: [],
    catalog: [],
    social: [],
    utility: [],
  };

  for (const moduleDef of getAllModules()) {
    grouped[moduleDef.meta.category].push(moduleDef);
  }

  return grouped;
}

// =====================================================
// Module Validation
// =====================================================

/**
 * Validate a block config against its module schema
 * @param moduleId - Module ID
 * @param config - Config to validate
 * @returns Validation result
 */
export function validateModuleConfig(
  moduleId: string,
  config: unknown
): { success: true; data: unknown } | { success: false; error: string } {
  const moduleDef = getModule(moduleId);

  if (!moduleDef) {
    return { success: false, error: `Module "${moduleId}" not found` };
  }

  const result = moduleDef.configSchema.safeParse(config);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.issues.map((issue) => issue.message).join(', '),
  };
}

/**
 * Get default config for a module
 * @param moduleId - Module ID
 * @returns Default config or undefined
 */
export function getModuleDefaultConfig(moduleId: string): unknown | undefined {
  return getModule(moduleId)?.defaultConfig;
}

// =====================================================
// Registry Statistics
// =====================================================

/**
 * Get registry statistics
 */
export function getRegistryStats(): {
  totalModules: number;
  byCategory: Record<ModuleCategory, number>;
} {
  const modules = getAllModules();
  const byCategory: Record<ModuleCategory, number> = {
    hero: 0,
    content: 0,
    media: 0,
    navigation: 0,
    contact: 0,
    catalog: 0,
    social: 0,
    utility: 0,
  };

  for (const moduleDef of modules) {
    byCategory[moduleDef.meta.category]++;
  }

  return {
    totalModules: modules.length,
    byCategory,
  };
}

// =====================================================
// Debug Utilities
// =====================================================

/**
 * List all registered module IDs (for debugging)
 */
export function listModuleIds(): string[] {
  return Array.from(moduleRegistry.keys());
}

/**
 * Clear all registered modules (for testing)
 */
export function clearRegistry(): void {
  moduleRegistry.clear();
}
