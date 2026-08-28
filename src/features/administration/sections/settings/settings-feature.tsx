import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getToday } from '@/lib/format';

import { getAccounts } from '@/features/accounting/lib/accounting-service';

import { getAdministrationAccess } from '../../lib/administration-access';
import {
  getPortalSettings,
  getUserRecords,
} from '../../lib/administration-service';

import { SettingsScreen } from './settings-screen';

// Open to every portal role: everyone manages their own profile and sessions
// here. Only `settings:manage` adds the portal-wide tabs.
export async function SettingsFeature() {
  const { user, permissions } = await requireSession();
  const access = getAdministrationAccess(permissions);
  const today = getToday();

  const record = (await getUserRecords()).find((entry) => entry.id === user.id);

  /*
   * Only the asset heads, and only for someone who can change settings. Cash
   * lives on the asset side of the chart, so offering the rest would only
   * invite a choice the API is going to reject.
   */
  const cashAccounts = access.canManageSettings
    ? (await getAccounts().catch(() => [])).filter(
        (account) => account.type === 'asset' && account.isActive,
      )
    : [];

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
        cashAccounts={cashAccounts}
        initialSettings={
          access.canManageSettings ? (await getPortalSettings()) : null
        }
      />
    </PageShell>
  );
}
