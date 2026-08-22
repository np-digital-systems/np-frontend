'use client';

import { useMemo, useState } from 'react';
import { BellOff, Check, CheckCheck, X } from 'lucide-react';

import {
  Card,
  EmptyState,
  PortalPageHeader,
  StatCard,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatStamp } from '@/lib/format';
import { cn } from '@/lib/utils';

import type {
  Notification,
  NotificationCategory,
  NotificationPriority,
} from '../constants/mock-data';

const PRIORITY_TONE: Record<NotificationPriority, string> = {
  Critical: 'bg-danger-subtle text-danger',
  Warning: 'bg-warning-subtle text-warning',
  Reminder: 'bg-info-subtle text-info',
  Information: 'bg-neutral-subtle text-text-secondary',
};

interface NotificationsScreenProps {
  initialNotifications: readonly Notification[];
}

export function NotificationsScreen({
  initialNotifications,
}: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<readonly Notification[]>(
    initialNotifications,
  );
  const [category, setCategory] = useState<NotificationCategory | 'all'>('all');

  const categories = useMemo(
    () =>
      [...new Set(initialNotifications.map((entry) => entry.category))].sort(),
    [initialNotifications],
  );

  const byCategory = useMemo(
    () =>
      category === 'all'
        ? notifications
        : notifications.filter((entry) => entry.category === category),
    [notifications, category],
  );

  const unread = byCategory.filter((entry) => !entry.read);
  const needsAction = notifications.filter(
    (entry) => entry.priority === 'Critical' || entry.priority === 'Warning',
  );

  function markRead(id: string) {
    setNotifications((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, read: true } : entry,
      ),
    );
  }

  function markAllRead() {
    setNotifications((current) =>
      current.map((entry) => ({ ...entry, read: true })),
    );
  }

  function dismiss(id: string) {
    setNotifications((current) => current.filter((entry) => entry.id !== id));
  }

  return (
    <>
      <PortalPageHeader
        title="Notifications"
        description="What the portal needs you to know about, newest first."
        meta={[
          <span key="total" className="tabular">
            {notifications.length} total
          </span>,
          notifications.some((entry) => !entry.read) ? (
            <span key="unread" className="text-primary tabular">
              {notifications.filter((entry) => !entry.read).length} unread
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          <>
            <Select
              value={category}
              onValueChange={(value) =>
                setCategory(value as NotificationCategory | 'all')
              }
            >
              <SelectTrigger aria-label="Filter by category">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>

                {categories.map((entry) => (
                  <SelectItem key={entry} value={entry}>
                    {entry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={markAllRead}
              disabled={!notifications.some((entry) => !entry.read)}
            >
              <CheckCheck />
              Mark all read
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Unread"
          value={String(notifications.filter((entry) => !entry.read).length)}
          caption="Not yet opened"
        />
        <StatCard
          label="Needs Attention"
          value={String(needsAction.length)}
          caption="Critical or warning"
        />
        <StatCard
          label="Categories"
          value={String(categories.length)}
          caption="Across the portal"
        />
        <StatCard
          label="Total"
          value={String(notifications.length)}
          caption="In your inbox"
        />
      </div>

      <Tabs defaultValue="unread">
        <TabsList>
          <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
          <TabsTrigger value="all">All ({byCategory.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="unread">
          <NotificationList
            notifications={unread}
            emptyTitle="Nothing unread"
            emptyDescription="You are up to date with everything the portal has flagged."
            onMarkRead={markRead}
            onDismiss={dismiss}
          />
        </TabsContent>

        <TabsContent value="all">
          <NotificationList
            notifications={byCategory}
            emptyTitle="No notifications"
            emptyDescription="Nothing has been raised in this category."
            onMarkRead={markRead}
            onDismiss={dismiss}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}

function NotificationList({
  notifications,
  emptyTitle,
  emptyDescription,
  onMarkRead,
  onDismiss,
}: {
  notifications: readonly Notification[];
  emptyTitle: string;
  emptyDescription: string;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  if (notifications.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={BellOff}
          title={emptyTitle}
          description={emptyDescription}
        />
      </Card>
    );
  }

  return (
    <Card>
      <ul className="divide-y divide-border">
        {notifications.map((entry) => (
          <li
            key={entry.id}
            className={cn('px-5 py-4', !entry.read && 'bg-primary-subtle/30')}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {!entry.read && (
                    <span
                      className="size-1.5 shrink-0 rounded-full bg-primary"
                      aria-label="Unread"
                    />
                  )}

                  <p className="text-[13px] font-medium text-text-primary">
                    {entry.title}
                  </p>

                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                      PRIORITY_TONE[entry.priority],
                    )}
                  >
                    {entry.priority}
                  </span>

                  <span className="text-[11px] text-text-muted">
                    {entry.category}
                  </span>
                </div>

                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  {entry.message}
                </p>

                {entry.meta && entry.meta.length > 0 && (
                  <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                    {entry.meta.map((item) => (
                      <div key={item.label} className="flex items-baseline gap-1.5">
                        <dt className="text-[11px] text-text-muted">
                          {item.label}
                        </dt>
                        <dd className="text-[11px] text-text-secondary">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                <p className="mt-2 text-[11px] text-text-muted tabular">
                  {formatStamp(entry.timestamp)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {!entry.read && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Mark "${entry.title}" as read`}
                    onClick={() => onMarkRead(entry.id)}
                  >
                    <Check />
                  </Button>
                )}

                {entry.dismissible && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Dismiss "${entry.title}"`}
                    onClick={() => onDismiss(entry.id)}
                  >
                    <X />
                  </Button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
