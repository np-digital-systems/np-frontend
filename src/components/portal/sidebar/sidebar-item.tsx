'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createElement } from 'react';

import { cn } from '@/lib/utils';
import { getPortalIcon } from './icons';

import type { PortalNavItem } from '@/config/navigation';

interface SidebarItemProps {
  item: PortalNavItem;
  collapsed: boolean;
}

export function SidebarItem({
  item,
  collapsed,
}: SidebarItemProps) {
  const pathname = usePathname();

  const isActive =
    pathname === item.href ||
    (item.href !== '/dashboard' &&
      pathname.startsWith(`${item.href}/`));

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex h-9 w-full items-center rounded-lg',
        'text-[13px] font-medium',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        collapsed
          ? 'justify-center px-0'
          : 'gap-3 px-3',
        isActive
          ? 'bg-sidebar-accent text-sidebar-primary'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
      )}
    >
      {isActive && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2',
            'rounded-full bg-sidebar-primary',
          )}
        />
      )}

      {/* createElement rather than <Icon />: the icon is looked up from a
          static map, but the lint rule that guards against components being
          constructed during render cannot tell the two apart. */}
      {createElement(getPortalIcon(item.icon), {
        className: cn(
          'size-4 shrink-0',
          isActive
            ? 'text-sidebar-primary'
            : 'text-sidebar-foreground/55 group-hover:text-sidebar-foreground/80',
        ),
        strokeWidth: 1.8,
      })}

      {!collapsed && (
        <span className="truncate">
          {item.label}
        </span>
      )}
    </Link>
  );
}