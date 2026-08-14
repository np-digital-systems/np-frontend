'use client'

import { Bell, CheckCheck } from 'lucide-react'
import { useState } from 'react'

import {
  NOTIFICATIONS,
  PRIORITY_CFG,
  relativeTime,
} from '@/features/notification/constants/mock-data'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function NotificationMenu() {
  const [notifications, setNotifications] =
    useState(NOTIFICATIONS)

  const unreadCount = notifications.filter(
    notification => !notification.read,
  ).length

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
    <Popover>
      {/* Trigger */}
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : 'Notifications'
          }
          className="
            relative
            size-9
            rounded-lg
            text-muted-foreground
            transition-colors
            hover:bg-muted
            hover:text-foreground
            focus-visible:ring-2
            focus-visible:ring-ring/50
          "
        >
          <Bell
            className="size-[17px]"
            strokeWidth={1.8}
          />

          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="
                absolute
                right-1
                top-1
                flex
                size-3.5
                items-center
                justify-center
                rounded-full
                bg-destructive
                text-[8px]
                font-semibold
                leading-none
                text-destructive-foreground
                ring-2
                ring-background
              "
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      {/* Popover */}
      <PopoverContent
        align="end"
        sideOffset={8}
        className="
          w-[360px]
          max-w-[calc(100vw-2rem)]
          overflow-hidden
          rounded-xl
          border-border
          bg-popover
          p-0
          text-popover-foreground
          shadow-lg
          font-sans
        "
      >
        {/* Header */}
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-border
            px-4
            py-3
          "
        >
          <div className="flex items-center gap-2">
            <div
              className="
                text-sm
                font-semibold
                leading-5
                tracking-[-0.01em]
              "
            >
              Notifications
            </div>

            {unreadCount > 0 && (
              <span
                className="
                  inline-flex
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-primary/10
                  px-1.5
                  py-0.5
                  text-[10px]
                  font-semibold
                  leading-4
                  tabular-nums
                  text-primary
                "
              >
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
              className="
                h-7
                rounded-md
                px-2
                text-xs
                font-medium
                text-muted-foreground
                hover:bg-muted
                hover:text-foreground
              "
            >
              <CheckCheck
                className="mr-1.5 size-3.5"
                strokeWidth={1.8}
              />

              Mark all read
            </Button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-[420px] overflow-y-auto">
          {preview.length === 0 ? (
            <EmptyNotifications />
          ) : (
            preview.map(notification => {
              const config =
                PRIORITY_CFG[notification.priority]

              return (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  priorityColor={config.dot}
                />
              )
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="
            border-t
            border-border
            p-2
          "
        >
          <Button
            type="button"
            variant="ghost"
            className="
              h-8
              w-full
              rounded-md
              text-xs
              font-medium
              text-muted-foreground
              hover:bg-muted
              hover:text-foreground
            "
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* -------------------------------------------------------------------------- */
/* Notification Item                                                          */
/* -------------------------------------------------------------------------- */

interface NotificationItemProps {
  notification: (typeof NOTIFICATIONS)[number]
  priorityColor: string
}

function NotificationItem({
  notification,
  priorityColor,
}: NotificationItemProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        `
          relative
          h-auto
          min-h-[72px]
          w-full
          justify-start
          gap-3
          rounded-none
          border-b
          border-border
          px-4
          py-3
          text-left
          font-sans
          whitespace-normal
          transition-colors
          hover:bg-muted/60
          focus-visible:bg-muted/60
        `,
        !notification.read &&
          'bg-primary/[0.025]',
      )}
    >
      {/* Priority dot */}
      <span
        aria-hidden="true"
        className="
          mt-[7px]
          size-1.5
          shrink-0
          rounded-full
        "
        style={{
          backgroundColor: priorityColor,
        }}
      />

      {/* Content */}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            `
              block
              truncate
              text-[13px]
              leading-5
              tracking-[-0.005em]
              text-foreground
            `,
            notification.read
              ? 'font-normal'
              : 'font-medium',
          )}
        >
          {notification.title}
        </span>

        <span
          className="
            mt-0.5
            block
            truncate
            text-xs
            leading-4
            text-muted-foreground
          "
        >
          {notification.entityRef
            ? `${notification.entityRef} · `
            : ''}
          {notification.category}
        </span>

        <span
          className="
            mt-0.5
            block
            text-[11px]
            leading-4
            text-muted-foreground/80
          "
        >
          {relativeTime(notification.timestamp)}
        </span>
      </span>

      {/* Unread indicator */}
      {!notification.read && (
        <span
          aria-hidden="true"
          className="
            mt-[7px]
            size-1.5
            shrink-0
            rounded-full
            bg-primary
          "
        />
      )}
    </Button>
  )
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyNotifications() {
  return (
    <div
      className="
        px-4
        py-10
        text-center
      "
    >
      <div
        className="
          mx-auto
          mb-3
          flex
          size-9
          items-center
          justify-center
          rounded-full
          bg-muted
        "
      >
        <Bell
          className="size-4 text-muted-foreground"
          strokeWidth={1.8}
        />
      </div>

      <div
        className="
          text-sm
          font-medium
          leading-5
          text-foreground
        "
      >
        You&apos;re all caught up
      </div>

      <p
        className="
          mt-1
          text-xs
          leading-4
          text-muted-foreground
        "
      >
        No new notifications.
      </p>
    </div>
  )
}