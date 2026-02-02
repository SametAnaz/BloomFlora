/**
 * Module System Exports
 * Re-exports all module system utilities
 */

// Types
export * from './types';

// Registry
export {
  registerModule,
  getModule,
  getModuleOrThrow,
  hasModule,
  getAllModules,
  getAllModuleMeta,
  getModulesByCategory,
  getModulesByTags,
  searchModules,
  getModulesGroupedByCategory,
  validateModuleConfig,
  getModuleDefaultConfig,
  getRegistryStats,
  listModuleIds,
  clearRegistry,
} from './registry';

// Module loader - imports and registers all modules
export { initializeModules, isModulesInitialized } from './loader';

// Renderer components
export { BlockRenderer, PageRenderer } from './renderer';

// Legacy moduleRegistry object for backwards compatibility
import { getAllModuleMeta, getModule as getModuleFn } from './registry';

export const moduleRegistry = {
  listModules: getAllModuleMeta,
  getModule: (id: string, version: string) => getModuleFn(`${id}.${version}`),
};

// Core modules (for direct access if needed)
export * from './core';
