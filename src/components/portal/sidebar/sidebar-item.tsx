'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createElement } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getPortalIcon } from './icons';

import type { PortalNavItem } from '@/config/navigation';

interface SidebarItemProps {
  item: PortalNavItem;
  collapsed: boolean;
}

export function SidebarItem({ item, collapsed }: SidebarItemProps) {
  const pathname = usePathname();

  const isActive =
    pathname === item.href ||
    (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

  const link = (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex h-9 w-full items-center rounded-lg',
        'text-[13px] transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
        collapsed ? 'justify-center px-0' : 'gap-3 px-3',
        isActive
          ? 'bg-sidebar-selected font-semibold text-sidebar-primary'
          : 'font-medium text-sidebar-foreground hover:bg-sidebar-accent',
      )}
    >
      {/* createElement because the lint rule can't tell a static icon map from a component created in render. */}
      {createElement(getPortalIcon(item.icon), {
        className: cn(
          'size-4 shrink-0 transition-colors',
          isActive
            ? 'text-sidebar-primary'
            : 'text-sidebar-muted group-hover:text-sidebar-foreground',
        ),
        strokeWidth: 1.8,
      })}

      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  // Collapsed: show the label as a tooltip.
  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}
