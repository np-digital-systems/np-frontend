'use client';

import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SidebarFooterProps {
  collapsed: boolean;
}

function rowClass(collapsed: boolean, destructive = false) {
  return cn(
    'flex h-9 w-full items-center rounded-lg',
    'text-[13px] font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
    collapsed ? 'justify-center' : 'gap-3 px-3',
    destructive
      ? 'text-sidebar-foreground hover:bg-danger-subtle hover:text-danger'
      : 'text-sidebar-foreground hover:bg-sidebar-accent',
  );
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  const settings = (
    <Link href="/administration/settings" className={rowClass(collapsed)}>
      <Settings className="size-4 shrink-0 text-sidebar-muted" strokeWidth={1.8} />
      {!collapsed && <span>Settings</span>}
    </Link>
  );

  const signOut = (
    <button type="button" className={cn(rowClass(collapsed, true), 'group')}>
      <LogOut
        className="size-4 shrink-0 text-sidebar-muted transition-colors group-hover:text-danger"
        strokeWidth={1.8}
      />
      {!collapsed && <span>Sign out</span>}
    </button>
  );

  if (!collapsed) {
    return (
      <div className="shrink-0 space-y-0.5 border-t border-sidebar-border p-2">
        {settings}
        {signOut}
      </div>
    );
  }

  return (
    <div className="shrink-0 space-y-0.5 border-t border-sidebar-border p-2">
      <Tooltip>
        <TooltipTrigger asChild>{settings}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          Settings
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>{signOut}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          Sign out
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
