import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getToday } from '@/lib/format';

import { getAdministrationAccess } from '../../lib/administration-access';
import {
  getPortalSettings,
  getUserRecords,
} from '../../lib/administration-service';

import { SettingsScreen } from './settings-screen';

// Open to every portal role: everyone manages their own profile and sessions
// here. Only `settings:manage` adds the portal-wide tabs.
export async function SettingsFeature() {
  const user = await getCurrentUser();
  const access = getAdministrationAccess(user.role);
  const today = getToday();

  const record = getUserRecords(today).find((entry) => entry.id === user.id);

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
      <SettingsScreen
        user={record}
        sessions={record.activeSessions}
        currentSessionId={record.activeSessions[0]?.id ?? ''}
        today={today}
        initialSettings={
          access.canManageSettings ? getPortalSettings() : null
        }
      />
    </PageShell>
  );
}
