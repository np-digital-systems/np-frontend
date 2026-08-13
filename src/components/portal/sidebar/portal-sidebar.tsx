'use client';

import { useState } from 'react';

import type { PortalNavGroup } from '@/config/navigation';

import { SidebarContent } from './sidebar-content';
import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';
import { SidebarToggle } from './sidebar-toggle';

interface PortalSidebarProps {
  navigation: readonly PortalNavGroup[];
}

export function PortalSidebar({
  navigation,
}: PortalSidebarProps) {
  const [collapsed, setCollapsed] =
    useState(false);

  return (
    <aside
      className={`
        relative flex h-screen shrink-0 flex-col
        border-r border-sidebar-border
        bg-sidebar
        transition-[width]
        duration-200 ease-out
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
          setCollapsed((value) => !value)
        }
      />
    </aside>
  );
}