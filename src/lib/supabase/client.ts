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
    console.error('Missing Supabase env vars:', { 
      hasUrl: !!url, 
      hasKey: !!key,
      url: url?.substring(0, 30) + '...'
    });
    throw new Error(
      'Missing Supabase environment variables. Please check Vercel Environment Variables.'
    );
  }

  return createBrowserClient<Database>(url, key);
}
