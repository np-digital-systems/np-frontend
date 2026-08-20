'use client';

import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
  collapsed: boolean;
}

export function SidebarHeader({ collapsed }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        'flex h-[var(--header-height)] shrink-0 items-center',
        'border-b border-sidebar-border',
        collapsed ? 'justify-center px-0' : 'gap-3 px-4',
      )}
    >
      <Link
        href="/dashboard"
        aria-label="NP Digital Management Portal"
        className={cn(
          'flex min-w-0 items-center rounded-lg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
          collapsed ? 'justify-center' : 'gap-3',
        )}
      >
        <span className="relative size-8 shrink-0 overflow-hidden rounded-lg border border-sidebar-border bg-sidebar-accent">
          <Image
            src="/logo-light.png"
            alt=""
            fill
            sizes="32px"
            className="object-contain p-1 dark:hidden"
          />

          <Image
            src="/logo-dark.png"
            alt=""
            fill
            sizes="32px"
            className="hidden object-contain p-1 dark:block"
          />
        </span>

        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold tracking-[-0.01em] text-sidebar-foreground">
              NP Digital
            </span>

            <span className="block truncate text-[11px] text-sidebar-muted">
              Management Portal
            </span>
          </span>
        )}
      </Link>
    </div>
  );
}
