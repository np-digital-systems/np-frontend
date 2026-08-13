'use client';

import Image from 'next/image';

interface SidebarHeaderProps {
  collapsed: boolean;
}

export function SidebarHeader({
  collapsed,
}: SidebarHeaderProps) {
  return (
    <div
      className={`
        flex h-16 shrink-0 items-center
        border-b border-sidebar-border
        px-4
        transition-all duration-200
        ${collapsed ? 'justify-center px-0' : 'gap-3'}
      `}
    >
      <div className="relative size-8 shrink-0 overflow-hidden rounded-lg border border-sidebar-border bg-sidebar-accent">
        <Image
          src="/logo-light.png"
          alt="NP Digital"
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
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-sidebar-foreground">
            NP Digital
          </p>

          <p className="truncate text-[11px] text-sidebar-foreground/45">
            Management Portal
          </p>
        </div>
      )}
    </div>
  );
}