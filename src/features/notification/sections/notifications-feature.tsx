import { PageShell } from '@/components/portal/ui';

import { getNotifications } from '../lib/notification-service';

import { NotificationsScreen } from './notifications-screen';

export async function NotificationsFeature() {
  const notifications = await getNotifications();

  return (
    <PageShell>
      <NotificationsScreen initialNotifications={notifications} />
    </PageShell>
  );
}
