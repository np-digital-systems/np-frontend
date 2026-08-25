import { PageShell } from '@/components/portal/ui';

import { NOTIFICATIONS } from '../constants/mock-data';

import { NotificationsScreen } from './notifications-screen';

export async function NotificationsFeature() {
  return (
    <PageShell>
      <NotificationsScreen initialNotifications={NOTIFICATIONS} />
    </PageShell>
  );
}
