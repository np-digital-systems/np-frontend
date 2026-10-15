import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
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
  const sponsors = await getSponsorRecords(year);

  return (
    <PageShell>
      <SponsorsScreen sponsors={sponsors} year={year} access={access} />
    </PageShell>
  );
}
