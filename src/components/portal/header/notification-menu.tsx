'use client'

import { Bell, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import {
  NOTIFICATIONS,
  PRIORITY_TONE,
  relativeTime,
} from '@/features/notification/constants/mock-data'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const TONE_DOT = {
  neutral: 'bg-text-disabled',
  info: 'bg-info',
  warning: 'bg-warning',
  danger: 'bg-danger',
} as const

export function NotificationMenu() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS)

  const unreadCount = notifications.filter((item) => !item.read).length

  const preview = notifications.slice(0, 5)

  function markAllRead() {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="relative rounded-lg"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
        >
          <Bell className="size-[17px]" strokeWidth={1.8} />

          {unreadCount > 0 && (
            <span
              aria-hidden
              className={cn(
                'absolute right-1 top-1 flex size-3.5 items-center justify-center',
                'rounded-full bg-danger text-[8px] font-semibold leading-none',
                'text-danger-foreground ring-2 ring-background tabular',
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] max-w-[calc(100vw-2rem)] gap-0 overflow-hidden rounded-xl p-0 shadow-lg"
      >
        <header className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-semibold tracking-[-0.01em]">
              Notifications
            </h2>

            {unreadCount > 0 && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary-subtle px-1.5 py-0.5 text-[10px] font-semibold text-primary tabular">
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
            >
              <CheckCheck className="size-3.5" strokeWidth={1.8} />
              Mark all read
            </Button>
          )}
        </header>

        <Separator />

        {preview.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <ScrollArea className="max-h-[380px]">
            <ul>
              {preview.map((notification, index) => (
                <li key={notification.id}>
                  {index > 0 && <Separator />}

                  <Link
                    href="/notifications"
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                      'hover:bg-interactive-hover',
                      'focus-visible:bg-interactive-hover focus-visible:outline-none',
                      !notification.read && 'bg-primary-subtle/40',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'mt-1.5 size-1.5 shrink-0 rounded-full',
                        TONE_DOT[PRIORITY_TONE[notification.priority]],
                      )}
                    />

                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block truncate text-[13px] leading-5 text-foreground',
                          notification.read ? 'font-normal' : 'font-medium',
                        )}
                      >
                        {notification.title}
                      </span>

                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {notification.entityRef && (
                          <span className="text-primary ref">
                            {notification.entityRef}
                          </span>
                        )}
                        {notification.entityRef ? ' · ' : ''}
                        {notification.category}
                      </span>

                      <span className="mt-0.5 block text-[11px] text-text-disabled">
                        {relativeTime(notification.timestamp)}
                      </span>
                    </span>

                    {!notification.read && (
                      <span
                        aria-hidden
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}

        <Separator />

        <div className="p-1.5">
          <Button
            asChild
            variant="ghost"
            className="h-8 w-full text-xs font-medium text-muted-foreground"
          >
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function EmptyNotifications() {
  return (
    <div className="px-4 py-10 text-center">
      <div className="mx-auto mb-3 flex size-9 items-center justify-center rounded-full bg-muted">
        <Bell className="size-4 text-muted-foreground" strokeWidth={1.8} />
      </div>

      <p className="text-[13px] font-medium text-foreground">
        You&apos;re all caught up
      </p>

      <p className="mt-1 text-xs text-muted-foreground">No new notifications.</p>
    </div>
  )
}
