'use server';

import { revalidatePath } from 'next/cache';

import { api } from '@/lib/api';

const NOTIFICATIONS_PATH = '/notifications';

export async function markNotificationRead(id: string): Promise<void> {
  await api.post(`/notifications/${id}/read`).catch(() => undefined);

  revalidatePath(NOTIFICATIONS_PATH);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post('/notifications/read-all').catch(() => undefined);

  revalidatePath(NOTIFICATIONS_PATH);
}

// The API refuses to dismiss notifications marked undismissible.
export async function dismissNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`).catch(() => undefined);

  revalidatePath(NOTIFICATIONS_PATH);
}
