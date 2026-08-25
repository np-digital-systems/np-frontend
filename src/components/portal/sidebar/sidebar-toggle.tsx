'use client';

import {
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

interface SidebarToggleProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarToggle({
  collapsed,
  onToggle,
}: SidebarToggleProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={
        collapsed
          ? 'Expand sidebar'
          : 'Collapse sidebar'
      }
      title={
        collapsed
          ? 'Expand sidebar'
          : 'Collapse sidebar'
      }
      className={cn(
        'absolute',
        '-right-3',
        'top-5',
        'z-50',
        'size-6',
        'rounded-full',
        'border',
        'border-sidebar-border',
        'bg-sidebar',
        'text-sidebar-foreground/60',
        'shadow-sm',
        'hover:bg-sidebar-accent',
        'hover:text-sidebar-foreground',
        'focus-visible:ring-2',
        'focus-visible:ring-ring/50',
      )}
    >
      {collapsed ? (
        <PanelLeftOpen
          className="size-3.5"
          strokeWidth={1.8}
        />
      ) : (
        <PanelLeftClose
          className="size-3.5"
          strokeWidth={1.8}
        />
      )}
    </Button>
  );
}