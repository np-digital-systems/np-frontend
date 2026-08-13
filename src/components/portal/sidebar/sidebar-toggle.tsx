'use client';

import {
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarToggleProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarToggle({
  collapsed,
  onToggle,
}: SidebarToggleProps) {
  return (
    <button
      type="button"
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
      className="
        absolute -right-3 top-5 z-20
        flex size-6 items-center justify-center
        rounded-full
        border border-sidebar-border
        bg-sidebar
        text-sidebar-foreground/60
        shadow-sm
        transition-colors
        hover:bg-sidebar-accent
        hover:text-sidebar-foreground
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-ring/50
      "
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
    </button>
  );
}