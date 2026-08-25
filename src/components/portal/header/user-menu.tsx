'use client'

import { LogOut, MonitorSmartphone, Settings, User } from 'lucide-react'
import Link from 'next/link'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import type { PortalUser } from '@/features/auth/types/user'
import type { UserRole } from '@/features/auth/types/user-role'

/**
 * Role chips stay muted on purpose. A saturated pill next to the avatar
 * competes with the header's only real accent — the unread badge.
 */
const ROLE_LABEL: Record<UserRole, { label: string; className: string }> = {
  admin: {
    label: 'Administrator',
    className: 'bg-primary-subtle text-primary',
  },
  accountant: {
    label: 'Accountant',
    className: 'bg-info-subtle text-info',
  },
  cashier: {
    label: 'Cashier',
    className: 'bg-success-subtle text-success',
  },
  user: {
    label: 'Member',
    className: 'bg-neutral-subtle text-text-muted',
  },
}

interface UserMenuProps {
  user: PortalUser
}

export function UserMenu({ user }: UserMenuProps) {
  const role = ROLE_LABEL[user.role]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-9 gap-2 rounded-lg px-1.5 pr-2"
          aria-label={`Account menu for ${user.name}`}
        >
          <Avatar size="sm">
            <AvatarFallback className="bg-primary text-[10px] font-semibold text-primary-foreground">
              {user.initials}
            </AvatarFallback>
          </Avatar>

          <span className="hidden text-[13px] font-medium md:block">
            {user.name}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 rounded-xl p-1.5 shadow-lg"
      >
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar>
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {user.initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold tracking-[-0.01em]">
              {user.name}
            </p>

            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {user.email}
            </p>

            <span
              className={cn(
                'mt-1.5 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                role.className,
              )}
            >
              {role.label}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="h-8 px-2 text-[13px]">
          <Link href="/administration/profile">
            <User />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="h-8 px-2 text-[13px]">
          <Link href="/administration/sessions">
            <MonitorSmartphone />
            My Sessions
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="h-8 px-2 text-[13px]">
          <Link href="/administration/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" className="h-8 px-2 text-[13px]">
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
