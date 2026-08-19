'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import type { PortalNavGroup } from '@/config/navigation';

import { SidebarItem } from './sidebar-item';

import { cn } from '@/lib/utils';

interface SidebarGroupProps {
  group: PortalNavGroup;
  collapsed: boolean;
}

export function SidebarGroup({
  group,
  collapsed,
}: SidebarGroupProps) {
  const [open, setOpen] = useState(
    group.defaultOpen ?? true,
  );

  if (collapsed) {
    return (
      <div className="space-y-1">
        {group.items.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            collapsed
          />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          'flex h-7 w-full items-center justify-between',
          'rounded-md px-3',
          'text-[10px] font-semibold uppercase tracking-[0.08em]',
          'text-sidebar-foreground/40',
          'transition-colors',
          'hover:text-sidebar-foreground/65',
          'focus-visible:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-ring/50',
        )}
      >
        <span>{group.label}</span>

        <ChevronDown
          className={`
            size-3.5
            transition-transform duration-200
            ${open ? 'rotate-0' : '-rotate-90'}
          `}
          strokeWidth={1.8}
        />
      </button>

      <div
        className={`
          grid transition-[grid-template-rows,opacity]
          duration-200 ease-out
          ${
            open
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0'
          }
        `}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                collapsed={false}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}