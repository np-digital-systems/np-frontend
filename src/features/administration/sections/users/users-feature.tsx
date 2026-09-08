import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getToday } from '@/lib/format';

import { getAdministrationAccess } from '../../lib/administration-access';
import { getDirectory, getUserRecords } from '../../lib/administration-service';

import { UsersScreen } from './users-screen';

export async function UsersFeature() {
  const { user, permissions } = await requireSession();
  const access = getAdministrationAccess(permissions);

  if (!access.canManageUsers) {
    return (
      <PageShell>
        <AccessDenied description="Managing portal accounts is limited to administrators." />
      </PageShell>
    );
  }

  const today = getToday();
  const [initialUsers, directory] = await Promise.all([getUserRecords(), getDirectory()]);

  return (
    <PageShell>
      <UsersScreen
        initialUsers={initialUsers}
        directory={directory}
        currentUserId={user.id}
        today={today}
      />
    </PageShell>
  );
}
