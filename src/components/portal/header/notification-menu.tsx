'use client'

import { Bell, CheckCheck } from 'lucide-react'
import { useState } from 'react'

import {
  NOTIFICATIONS,
  PRIORITY_CFG,
  relativeTime,
} from '@/features/notification/constants/mock-data'

import { cn } from '@/lib/utils'

export function NotificationMenu() {
  const [open, setOpen] = useState(false)

  const [notifications, setNotifications] =
    useState(NOTIFICATIONS)

  const unreadCount =
    notifications.filter(item => !item.read).length

  const preview = notifications.slice(0, 5)

  function markAllRead() {
    setNotifications(items =>
      items.map(item => ({
        ...item,
        read: true,
      })),
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-label="Notifications"
        aria-expanded={open}
        className="
          relative flex size-9
          items-center justify-center
          rounded-lg
          text-muted-foreground
          transition-colors
          hover:bg-muted
          hover:text-foreground
        "
      >
        <Bell className="size-[17px]" />

        {unreadCount > 0 && (
          <span
            className="
              absolute right-1 top-1
              flex size-3.5
              items-center justify-center
              rounded-full
              bg-destructive
              text-[8px]
              font-semibold
              text-destructive-foreground
            "
          >
            {unreadCount > 9
              ? '9+'
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="
            absolute right-0 top-full z-50 mt-2
            w-[360px]
            max-w-[calc(100vw-2rem)]
            overflow-hidden
            rounded-xl
            border
            border-border
            bg-popover
            shadow-xl
          "
        >
          {/* Header */}
          <div
            className="
              flex items-center justify-between
              border-b border-border
              px-4 py-3
            "
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">
                Notifications
              </h3>

              {unreadCount > 0 && (
                <span
                  className="
                    rounded-full
                    bg-primary/10
                    px-1.5 py-0.5
                    text-[10px]
                    font-medium
                    text-primary
                  "
                >
                  {unreadCount}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="
                  flex items-center gap-1.5
                  text-xs
                  text-primary
                  hover:underline
                "
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Items */}
          <div>
            {preview.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto mb-2 size-5 text-muted-foreground/50" />

                <p className="text-sm font-medium">
                  You&apos;re all caught up
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  No new notifications.
                </p>
              </div>
            ) : (
              preview.map(notification => {
                const config =
                  PRIORITY_CFG[
                    notification.priority
                  ]

                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={cn(
                      `
                        flex w-full gap-3
                        border-b border-border
                        px-4 py-3
                        text-left
                        transition-colors
                        hover:bg-muted
                      `,
                      !notification.read &&
                        'bg-primary/[0.03]',
                    )}
                  >
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          config.dot,
                      }}
                    />

                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block truncate text-sm',
                          !notification.read
                            ? 'font-medium'
                            : 'font-normal',
                        )}
                      >
                        {notification.title}
                      </span>

                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {notification.entityRef
                          ? `${notification.entityRef} · `
                          : ''}
                        {notification.category}
                      </span>

                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {relativeTime(
                          notification.timestamp,
                        )}
                      </span>
                    </span>

                    {!notification.read && (
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                w-full rounded-lg
                px-3 py-2
                text-center text-xs
                font-medium
                text-primary
                transition-colors
                hover:bg-primary/10
              "
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}