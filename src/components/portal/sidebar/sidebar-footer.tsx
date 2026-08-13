'use client';

import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';

interface SidebarFooterProps {
  collapsed: boolean;
}

export function SidebarFooter({
  collapsed,
}: SidebarFooterProps) {
  return (
    <div className="shrink-0 border-t border-sidebar-border p-2">
      <Link
        href="/administration/settings"
        title={collapsed ? 'Settings' : undefined}
        className={`
          flex h-9 items-center rounded-lg
          text-[13px] font-medium
          text-sidebar-foreground/65
          transition-colors
          hover:bg-sidebar-accent
          hover:text-sidebar-foreground
          ${collapsed ? 'justify-center' : 'gap-3 px-3'}
        `}
      >
        <Settings
          className="size-4 shrink-0"
          strokeWidth={1.8}
        />

        {!collapsed && <span>Settings</span>}
      </Link>

      <button
        type="button"
        title={collapsed ? 'Sign out' : undefined}
        className={`
          flex h-9 w-full items-center rounded-lg
          text-[13px] font-medium
          text-sidebar-foreground/65
          transition-colors
          hover:bg-sidebar-accent
          hover:text-sidebar-foreground
          ${collapsed ? 'justify-center' : 'gap-3 px-3'}
        `}
      >
        <LogOut
          className="size-4 shrink-0"
          strokeWidth={1.8}
        />

        {!collapsed && <span>Sign out</span>}
      </button>
    </div>
  );
}