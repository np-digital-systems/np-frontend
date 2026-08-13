'use client'

import { Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { PortalBreadcrumbs } from './portal-breadcrumbs'
import { PortalSearch } from './portal-search'
import { FinancialYearSelector } from './financial-year-selector'
import { NotificationMenu } from './notification-menu'
import { UserMenu } from './user-menu'


export function PortalHeader() {
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'

  return (
    <header
      className="
        sticky top-0 z-30
        h-[var(--header-height)]
        border-b border-border
        bg-background/80
        backdrop-blur-xl
      "
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu */}
          <button
            type="button"
            aria-label="Open navigation"
            className="
              flex size-9 items-center justify-center
              rounded-lg
              text-muted-foreground
              transition-colors
              hover:bg-muted
              hover:text-foreground
              lg:hidden
            "
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
          <NotificationMenu />

          {/* Theme */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={
              isDark
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
            className="
              flex size-9 items-center justify-center
              rounded-lg
              text-muted-foreground
              transition-colors
              hover:bg-muted
              hover:text-foreground
            "
          >
            {isDark ? (
              <Sun className="size-[17px]" />
            ) : (
              <Moon className="size-[17px]" />
            )}
          </button>

          <div className="mx-1.5 hidden h-5 w-px bg-border sm:block" />

          {/* User */}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}