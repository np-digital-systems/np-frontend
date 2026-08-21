import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getToday } from '@/lib/format';

import { getAdministrationAccess } from '../../lib/administration-access';
import { getUserRecords } from '../../lib/administration-service';

import { UsersScreen } from './users-screen';

/**
 * Users boundary.
 *
 * `user:manage` is the admin's alone: this screen decides who can reach the
 * portal at all, and what they can do once they are in.
 */
export async function UsersFeature() {
  const user = await getCurrentUser();
  const access = getAdministrationAccess(user.role);

  if (!access.canManageUsers) {
    return (
      <PageShell>
        <AccessDenied description="Managing portal accounts is limited to administrators." />
      </PageShell>
    );
  }

  const today = getToday();

  return (
    <PageShell>
      <UsersScreen
        initialUsers={getUserRecords(today)}
        currentUserId={user.id}
        today={today}
      />
    </PageShell>
  );
}
