import { AccessDenied, PageShell } from '@/components/portal/ui';

import { getMyProfile } from '../../lib/administration-service';

import { ProfileScreen } from './profile-screen';

export async function ProfileFeature() {
  const record = await getMyProfile().catch(() => null);

  if (!record) {
    return (
      <PageShell>
        <AccessDenied
          title="Account not found"
          description="Try signing out and back in."
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
