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

// Open to every role for profile and sessions; `settings:manage` adds the portal-wide tabs.
export async function SettingsFeature() {
  const { user, permissions } = await requireSession();
  const access = getAdministrationAccess(permissions);
  const today = getToday();

  const record = (await getUserRecords()).find((entry) => entry.id === user.id);

  // Asset heads only; the API rejects any other type for the cash account.
  const chart = access.canManageSettings
    ? await getAccounts().catch(() => [])
    : [];

  const cashAccounts = chart.filter(
    (account) => account.type === 'asset' && account.isActive,
  );

  // Income heads only; the API rejects any other type for sanththa and deposit interest.
  const incomeAccounts = chart.filter(
    (account) => account.type === 'income' && account.isActive,
  );

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
      <SettingsScreen
        user={record}
        sessions={record.activeSessions}
        currentSessionId={record.activeSessions[0]?.id ?? ''}
        today={today}
        cashAccounts={cashAccounts}
        incomeAccounts={incomeAccounts}
        initialSettings={
          access.canManageSettings ? (await getPortalSettings()) : null
        }
      />
    </PageShell>
  );
}
