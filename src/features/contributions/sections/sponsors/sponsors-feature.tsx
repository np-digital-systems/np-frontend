import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getPartyOptions } from '@/features/accounting/lib/accounting-service';
import { getActiveYear, getToday } from '@/lib/format';

import { getContributionAccess } from '../../lib/contributions-access';
import { getSponsorRecords } from '../../lib/sponsors-service';

import { SponsorsScreen } from './sponsors-screen';

export async function SponsorsFeature() {
  const { permissions } = await requireSession();
  const access = getContributionAccess(permissions);

  if (!access.canView) {
    return (
      <PageShell>
        <AccessDenied description="Ask an administrator for access." />
      </PageShell>
    );
  }

  const year = getActiveYear(getToday());
  const [sponsors, parties] = await Promise.all([
    getSponsorRecords(year),
    access.canManage ? getPartyOptions().catch(() => []) : [],
  ]);

  // Only a person who isn't on the register yet can be enrolled.
  const people = parties.filter((party) => party.type === 'person' && !party.isSponsor);

  return (
    <PageShell>
      <SponsorsScreen sponsors={sponsors} people={people} access={access} />
    </PageShell>
  );
}
