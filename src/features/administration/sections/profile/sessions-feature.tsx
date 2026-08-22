import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getToday } from '@/lib/format';

import { getUserRecords } from '../../lib/administration-service';

import { SessionsScreen } from './sessions-screen';

export async function SessionsFeature() {
  const user = await getCurrentUser();
  const today = getToday();

  const record = getUserRecords(today).find((entry) => entry.id === user.id);

  if (!record) {
    return (
      <PageShell>
        <AccessDenied
          title="Account not found"
          description="Your sessions could not be loaded. Sign out and back in, or contact an administrator."
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SessionsScreen
        initialSessions={record.activeSessions}
        currentSessionId={record.activeSessions[0]?.id ?? ''}
        today={today}
      />
    </PageShell>
  );
}
