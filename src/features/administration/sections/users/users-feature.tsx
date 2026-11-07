import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getToday } from '@/lib/format';

import { getAdministrationAccess } from '../../lib/administration-access';
import { getUserRecords } from '../../lib/administration-service';

import { UsersScreen } from './users-screen';

export async function UsersFeature() {
  const { user, permissions } = await requireSession();
  const access = getAdministrationAccess(permissions);

  if (!access.canManageUsers) {
    return (
      <PageShell>
        <AccessDenied description="Only administrators have access." />
      </PageShell>
    );
  }

  const today = getToday();
  const initialUsers = await getUserRecords();

  return (
    <PageShell>
      <UsersScreen
        initialUsers={initialUsers}
        currentUserId={user.id}
        today={today}
      />
    </PageShell>
  );
}
