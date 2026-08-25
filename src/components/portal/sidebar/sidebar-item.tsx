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
        // Selected rows take a tinted fill and the accent hue, the way a
        // macOS sidebar marks selection — not a grey block with grey text.
        isActive
          ? 'bg-sidebar-selected font-semibold text-sidebar-primary'
          : 'font-medium text-sidebar-foreground hover:bg-sidebar-accent',
      )}
    >
      {/* createElement rather than <Icon />: the icon is looked up from a
          static map, but the lint rule that guards against components being
          constructed during render cannot tell the two apart. */}
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

  // Collapsed to icons only, the label has to come from somewhere.
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
