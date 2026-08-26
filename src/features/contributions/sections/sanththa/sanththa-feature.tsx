import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getContributionAccess } from '../../lib/contributions-access';
import { getMemberRecords, getYears } from '../../lib/contributions-service';

import { SanththaScreen } from './sanththa-screen';

interface SanththaFeatureProps {
  /** Which subscription year to show; defaults to the current one. */
  year?: string;
}

export async function SanththaFeature({ year }: SanththaFeatureProps) {
  const { permissions } = await requireSession();
  const access = getContributionAccess(permissions);

  if (!access.canView) {
    return (
      <PageShell>
        <AccessDenied description="The Sanththa register is available to temple staff. Contact an administrator if you need access." />
      </PageShell>
    );
  }

  const years = await getYears();
  const requested = Number(year);
  const selected = years.includes(requested)
    ? requested
    : getActiveYear(getToday());

  const members = await getMemberRecords(selected);

  return (
    <PageShell>
      <SanththaScreen
        initialMembers={members}
        years={years}
        year={selected}
        access={access}
      />
    </PageShell>
  );
}
