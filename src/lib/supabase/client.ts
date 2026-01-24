import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './types';

/**
 * Supabase client for browser/client components
 * Use this in Client Components (components with "use client" directive)
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Please check .env.local'
    );
  }

  return createBrowserClient<Database>(url, key);
}
