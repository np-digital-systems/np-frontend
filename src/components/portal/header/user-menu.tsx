'use client'

import {
  ChevronDown,
  LogOut,
  MonitorSmartphone,
  Settings,
  User,
} from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import type { PortalUser } from '@/features/auth/types/user'
import type { UserRole } from '@/features/auth/types/user-role'

const roleConfig: Record<
  UserRole,
  {
    label: string
    className: string
  }
> = {
  admin: {
    label: 'Administrator',
    className:
      'bg-warning-subtle text-warning',
  },

  accountant: {
    label: 'Accountant',
    className:
      'bg-primary/10 text-primary',
  },

  cashier: {
    label: 'Cashier',
    className:
      'bg-success-subtle text-success',
  },

  user: {
    label: 'User',
    className:
      'bg-muted text-muted-foreground',
  },
}

interface UserMenuProps {
  user: PortalUser
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false)

  const role = roleConfig[user.role]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        className={cn(
          'flex h-9 items-center gap-2',
          'rounded-lg',
          'px-1.5',
          'transition-colors',
          'hover:bg-muted',
        )}
      >
        <div
          className={cn(
            'flex size-7 shrink-0',
            'items-center justify-center',
            'rounded-full',
            'bg-primary',
            'text-[11px]',
            'font-semibold',
            'text-primary-foreground',
          )}
        >
          {user.initials}
        </div>

        <div className="hidden text-left md:block">
          <p className="text-xs font-medium leading-none">
            {user.name}
          </p>
        </div>

        <ChevronDown
          className={cn(
            'size-3.5 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full z-50 mt-2',
            'w-60',
            'overflow-hidden',
            'rounded-xl',
            'border',
            'border-border',
            'bg-popover',
            'p-1',
            'shadow-xl',
          )}
        >
          {/* User */}
          <div
            className={cn(
              'mb-1',
              'flex items-center gap-3',
              'rounded-lg',
              'px-3 py-3',
            )}
          >
            <div
              className={cn(
                'flex size-9 shrink-0',
                'items-center justify-center',
                'rounded-full',
                'bg-primary',
                'text-xs font-semibold',
                'text-primary-foreground',
              )}
            >
              {user.initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user.name}
              </p>

              <span
                className={cn(
                  'mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                  role.className,
                )}
              >
                {role.label}
              </span>
            </div>
          </div>

          <div className="h-px bg-border" />

          <MenuItem
            icon={User}
            label="Profile"
          />

          <MenuItem
            icon={MonitorSmartphone}
            label="My Sessions"
          />

          <MenuItem
            icon={Settings}
            label="Settings"
          />

          <div className="my-1 h-px bg-border" />

          <MenuItem
            icon={LogOut}
            label="Sign out"
            destructive
          />
        </div>
      )}
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  destructive = false,
}: {
  icon: typeof User
  label: string
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        `
          flex w-full items-center gap-2.5
          rounded-lg
          px-3 py-2
          text-sm
          transition-colors
        `,
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}