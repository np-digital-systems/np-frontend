'use client'

import { Menu } from 'lucide-react'

import { PortalBreadcrumbs } from './portal-breadcrumbs'
import { PortalSearch } from './portal-search'
import { FinancialYearSelector } from './financial-year-selector'
import type { Notification } from '@/features/notification/constants/notification-shapes'

import { NotificationMenu } from './notification-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UserMenu } from './user-menu'

import type { PortalUser } from '@/features/auth/types/user'

import { cn } from '@/lib/utils';


interface PortalHeaderProps {
  notifications: readonly Notification[];
  user: PortalUser
}


export function PortalHeader({ notifications, user }: PortalHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30',
        'h-[var(--header-height)]',
        'border-b border-border',
        'bg-background/80',
        'backdrop-blur-xl',
      )}
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu */}
          <button
            type="button"
            aria-label="Open navigation"
            className={cn(
              'flex size-9 items-center justify-center',
              'rounded-lg',
              'text-muted-foreground',
              'transition-colors',
              'hover:bg-muted',
              'hover:text-foreground',
              'lg:hidden',
            )}
          >
            <Menu className="size-[18px]" />
          </button>

          <PortalBreadcrumbs />
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Search */}
          <PortalSearch />

          <div className="mx-1.5 hidden h-5 w-px bg-border sm:block" />

          {/* Financial year */}
          <FinancialYearSelector />

          {/* Notifications */}
          <NotificationMenu notifications={notifications} />

          <ThemeToggle/>

          <div className="mx-1.5 hidden h-5 w-px bg-border sm:block" />

          {/* User */}
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}