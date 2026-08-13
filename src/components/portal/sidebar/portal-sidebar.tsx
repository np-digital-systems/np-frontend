'use client';

import type { PortalNavGroup } from '@/config/navigation';

import { SidebarContent } from './sidebar-content';
import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';
import { SidebarToggle } from './sidebar-toggle';

interface PortalSidebarProps {
  navigation: readonly PortalNavGroup[];
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function PortalSidebar({
  navigation,
  collapsed,
  onCollapsedChange,
}: PortalSidebarProps) {
  return (
    <aside
      className={`
        relative
        z-40
        flex
        h-screen
        shrink-0
        flex-col
        border-r
        border-sidebar-border
        bg-sidebar
        text-sidebar-foreground
        transition-[width]
        duration-200
        ease-out
        ${collapsed ? 'w-[72px]' : 'w-[248px]'}
      `}
    >
      <SidebarHeader collapsed={collapsed} />

      <SidebarContent
        navigation={navigation}
        collapsed={collapsed}
      />

      <SidebarFooter collapsed={collapsed} />

      <SidebarToggle
        collapsed={collapsed}
        onToggle={() =>
          onCollapsedChange(!collapsed)
        }
      />
    </aside>
  );
}