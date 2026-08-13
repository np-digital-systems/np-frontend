'use client';

import { useState } from 'react';

import type { PortalNavGroup } from '@/config/navigation';

import { PortalHeader } from '@/components/portal/header';
import { PortalSidebar } from '@/components/portal/sidebar';

interface PortalShellProps {
  children: React.ReactNode;
  navigation: readonly PortalNavGroup[];
}

export function PortalShell({
  children,
  navigation,
}: PortalShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  return (
    <div className="flex min-h-screen">
      <PortalSidebar
        navigation={navigation}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalHeader />

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}