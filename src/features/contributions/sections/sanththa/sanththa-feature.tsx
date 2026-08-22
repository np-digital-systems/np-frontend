import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getContributionAccess } from '../../lib/contributions-access';
import {
  getCollectionTrend,
  getMemberRecords,
  getSanththaSummary,
} from '../../lib/contributions-service';
import { redactMembers } from '../../lib/contributions-privacy';

import { SanththaScreen } from './sanththa-screen';

export async function SanththaFeature() {
  const user = await getCurrentUser();
  const access = getContributionAccess(user.role);

  if (!access.canView) {
    return (
      <PageShell>
        <AccessDenied description="The Sanththa register is available to temple staff. Contact an administrator if you need access." />
      </PageShell>
    );
  }

  const today = getToday();

  return (
    <PageShell>
      <SanththaScreen
        initialMembers={redactMembers(
          getMemberRecords(today),
          access.canSeeContact,
        )}
        summary={getSanththaSummary(today)}
        trend={getCollectionTrend(today)}
        access={access}
        today={today}
        year={getActiveYear(today)}
      />
    </PageShell>
  );
}
