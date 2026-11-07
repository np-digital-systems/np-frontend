import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getContributionAccess } from '../../lib/contributions-access';
import {
  getMemberRecords,
  getSanththaPosting,
  getSanththaSummary,
  getYears,
} from '../../lib/contributions-service';
import { getSponsorRecords } from '../../lib/sponsors-service';

import { SanththaScreen } from './sanththa-screen';

interface SanththaFeatureProps {
  /** Defaults to the current year. */
  year?: string;
}

export async function SanththaFeature({ year }: SanththaFeatureProps) {
  const { permissions } = await requireSession();
  const access = getContributionAccess(permissions);

  if (!access.canView) {
    return (
      <PageShell>
        <AccessDenied description="Ask an administrator for access." />
      </PageShell>
    );
  }

  const years = await getYears();
  const requested = Number(year);
  const selected = years.includes(requested)
    ? requested
    : getActiveYear(getToday());

  const [members, summary, posting, register] = await Promise.all([
    getMemberRecords(selected),
    getSanththaSummary(selected),
    getSanththaPosting(),
    access.canRecord ? getSponsorRecords(selected) : [],
  ]);

  // Anyone already on this year's list can't be added again.
  const listed = new Set(members.map((member) => member.id));
  const candidates = register.filter(
    (member) => member.isActive && !listed.has(String(member.partyId)),
  );

  return (
    <PageShell>
      <SanththaScreen
        initialMembers={members}
        years={years}
        year={selected}
        rate={summary.rate}
        posting={posting}
        candidates={candidates}
        access={access}
      />
    </PageShell>
  );
}
