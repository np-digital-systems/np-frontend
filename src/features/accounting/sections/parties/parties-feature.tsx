import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import { getPartyRecords } from '../../lib/accounting-service';

import { PartiesScreen } from './parties-screen';

export async function PartiesFeature() {
  const { permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canViewParties) {
    return (
      <PageShell>
        <AccessDenied description="Parties are limited to administrators and accountants." />
      </PageShell>
    );
  }

  const initialParties = await getPartyRecords();

  return (
    <PageShell>
      <PartiesScreen
        initialParties={initialParties}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
