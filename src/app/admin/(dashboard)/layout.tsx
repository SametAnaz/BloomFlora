/**
 * Admin Layout
 * Desktop-first admin panel with authentication
 */

import { AdminShell } from '@/components/admin/admin-shell';
import { createClient } from '@/lib/supabase/server';
import { initializeModules } from '@/modules';

// Initialize modules for page builder
initializeModules();

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Get user (middleware already handles redirect if not authenticated)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <AdminShell userEmail={user?.email}>
      {children}
    </AdminShell>
  );
}
