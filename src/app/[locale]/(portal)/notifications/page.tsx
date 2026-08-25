import type { Metadata } from 'next';

import { NotificationsFeature } from '@/features/notification';

export const metadata: Metadata = {
  title: 'Notifications',
};

export default function NotificationsPage() {
  return <NotificationsFeature />;
}
