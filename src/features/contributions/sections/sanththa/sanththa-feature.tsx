import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getContributionAccess } from '../../lib/contributions-access';
import { getMemberRecords, getYears } from '../../lib/contributions-service';

import { SanththaScreen } from './sanththa-screen';

interface SanththaFeatureProps {
  /** Which subscription year to show; defaults to the current one. */
  year?: string;
}

export async function SanththaFeature({ year }: SanththaFeatureProps) {
  const user = await getCurrentUser();
  const access = getContributionAccess(user.role);

  if (!access.canView) {
    return (
      <PageShell>
        <AccessDenied description="The Sanththa register is available to temple staff. Contact an administrator if you need access." />
      </PageShell>
    );
  }

  const years = getYears();
  const requested = Number(year);
  const selected = years.includes(requested)
    ? requested
    : getActiveYear(getToday());

  return (
    <PageShell>
      <SanththaScreen
        initialMembers={getMemberRecords(selected)}
        years={years}
        year={selected}
        access={access}
        user={user}
      />
    </PageShell>
  );
}
