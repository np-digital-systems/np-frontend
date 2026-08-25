'use client';

import { useState } from 'react';

import type { PortalNavGroup } from '@/config/navigation';
import type { PortalUser } from '@/features/auth/types/user';

import { PortalHeader } from '@/components/portal/header';
import { PortalSidebar } from '@/components/portal/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

interface PortalShellProps {
  children: React.ReactNode;
  navigation: readonly PortalNavGroup[];
  user: PortalUser;
}

export function PortalShell({
  children,
  navigation,
  user,
}: PortalShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    // Tooltips are used by the collapsed sidebar rail, so the provider has to
    // sit above both the sidebar and the content.
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-screen">
        <PortalSidebar
          navigation={navigation}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <PortalHeader user={user} />

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
