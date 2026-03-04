/**
 * Module Loader
 * Imports and registers all modules on app initialization
 */

import { contactFormV1Module } from './core/contactForm';
import { ctaV1Module } from './core/cta';
import { dividerV1Module } from './core/divider';
import { faqV1Module } from './core/faq';
import { featuresV1Module } from './core/features';
import { heroV1Module } from './core/hero';
import { imageGalleryV1Module } from './core/imageGallery';
import { logosV1Module } from './core/logos';
import { mapV1Module } from './core/map';
import { pricingV1Module } from './core/pricing';
import { richTextV1Module } from './core/richText';
import { statsV1Module } from './core/stats';
import { teamV1Module } from './core/team';
import { testimonialsV1Module } from './core/testimonials';
import { videoV1Module } from './core/video';
import { registerModule } from './registry';

// Import all core modules

// Track initialization
let initialized = false;

/**
 * Initialize and register all modules
 * Call this once at app startup (e.g., in layout.tsx or _app.tsx)
 */
export function initializeModules(): void {
  if (initialized) {
    return;
  }

  // Register core modules - Hero & CTA
  registerModule(heroV1Module);
  registerModule(ctaV1Module);

  // Register content modules
  registerModule(richTextV1Module);
  registerModule(featuresV1Module);
  registerModule(statsV1Module);
  registerModule(faqV1Module);
  registerModule(teamV1Module);

  // Register media modules
  registerModule(imageGalleryV1Module);
  registerModule(videoV1Module);
  registerModule(logosV1Module);

  // Register contact modules
  registerModule(contactFormV1Module);
  registerModule(mapV1Module);

  // Register catalog modules
  registerModule(pricingV1Module);

  // Register social modules
  registerModule(testimonialsV1Module);

  // Register utility modules
  registerModule(dividerV1Module);

  // Mark as initialized
  initialized = true;

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.info('[Modules] Initialized with 15 modules');
  }
}

/**
 * Check if modules have been initialized
 */
export function isModulesInitialized(): boolean {
  return initialized;
}

/**
 * Reset initialization state (for testing)
 */
export function resetModuleInitialization(): void {
  initialized = false;
}
