'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import type { PortalNavGroup } from '@/config/navigation';

import { SidebarItem } from './sidebar-item';

interface SidebarGroupProps {
  group: PortalNavGroup;
  collapsed: boolean;
}

export function SidebarGroup({ group, collapsed }: SidebarGroupProps) {
  const [open, setOpen] = useState(group.defaultOpen ?? true);

  // Collapsed to the icon rail there is no room for a heading, and nothing
  // to collapse — the group becomes a plain run of icons.
  if (collapsed) {
    return (
      <div className="space-y-1">
        {group.items.map((item) => (
          <SidebarItem key={item.id} item={item} collapsed />
        ))}
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-1">
      <CollapsibleTrigger
        className={cn(
          'flex h-7 w-full items-center justify-between rounded-md px-3',
          'text-[11px] font-semibold uppercase tracking-[0.06em]',
          'text-sidebar-muted transition-colors',
          'hover:text-sidebar-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
        )}
      >
        <span>{group.label}</span>

        <ChevronDown
          className={cn(
            'size-3.5 transition-transform duration-200',
            open ? 'rotate-0' : '-rotate-90',
          )}
          strokeWidth={2}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-closed:animate-collapsible-up data-open:animate-collapsible-down">
        <div className="space-y-0.5">
          {group.items.map((item) => (
            <SidebarItem key={item.id} item={item} collapsed={false} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
