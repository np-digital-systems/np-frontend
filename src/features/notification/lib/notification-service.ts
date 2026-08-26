import 'server-only';

import { api, type Page } from '@/lib/api';

import type { Notification } from '../constants/notification-shapes';

interface ApiNotification {
  readonly id: string;
  readonly category: Notification['category'];
  readonly priority: Notification['priority'];
  readonly title: string;
  readonly message: string;
  readonly entityType: string | null;
  readonly entityRef: string | null;
  readonly actionLabel: string | null;
  readonly actionPage: string | null;
  readonly meta: readonly { label: string; value: string }[] | null;
  readonly timestamp: string;
  readonly read: boolean;
  readonly dismissible: boolean;
}

function toNotification(row: ApiNotification): Notification {
  return {
    id: row.id,
    category: row.category,
    priority: row.priority,
    title: row.title,
    message: row.message,
    entityType: row.entityType ?? undefined,
    entityRef: row.entityRef ?? undefined,
    actionLabel: row.actionLabel ?? undefined,
    actionPage: row.actionPage ?? undefined,
    timestamp: row.timestamp,
    read: row.read,
    dismissible: row.dismissible,
    meta: row.meta ? [...row.meta] : undefined,
  };
}

/** Your inbox. Every signed-in user has one; no permission gates it. */
export async function getNotifications(): Promise<Notification[]> {
  const page = await api.get<Page<ApiNotification>>('/notifications', {
    query: { limit: 100 },
  });

  return page.data.map(toNotification);
}

export interface NotificationCounts {
  readonly total: number;
  readonly unread: number;
}

export async function getNotificationCounts(): Promise<NotificationCounts> {
  return api.get<NotificationCounts>('/notifications/counts');
}
