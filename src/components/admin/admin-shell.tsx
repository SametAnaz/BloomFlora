/**
 * Admin Shell Component
 * Client-side wrapper that manages sidebar state
 */

'use client';

import { useState } from 'react';

import { AdminHeader } from './header';
import { MobileWarning } from './mobile-warning';
import { AdminSidebar } from './sidebar';

interface AdminShellProps {
  children: React.ReactNode;
  userEmail?: string;
}

export function AdminShell({ children, userEmail }: AdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Warning Overlay */}
      <MobileWarning />

      {/* Admin Layout */}
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <AdminSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <AdminHeader userEmail={userEmail} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
