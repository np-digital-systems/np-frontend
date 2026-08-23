import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getToday } from '@/lib/format';

import { getUserRecords } from '../../lib/administration-service';

import { ProfileScreen } from './profile-screen';

export async function ProfileFeature() {
  const user = await getCurrentUser();

  const record = getUserRecords(getToday()).find(
    (entry) => entry.id === user.id,
  );

  if (!record) {
    return (
      <PageShell>
        <AccessDenied
          title="Account not found"
          description="Your account could not be loaded. Sign out and back in, or contact an administrator."
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ProfileScreen user={record} />
    </PageShell>
  );
}
