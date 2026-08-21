import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getFinanceAccess } from '../../lib/finance-access';
import { getFundRecords, getProjectRecords } from '../../lib/finance-service';

import { ProjectsScreen } from './projects-screen';

/**
 * Projects boundary.
 *
 * A project is a budget-tracking construct rather than a decision about the
 * temple's money, so `project:manage` sits with the accountant alongside the
 * chart of accounts — the bookkeeping side of the line this module draws.
 */
export async function ProjectsFeature() {
  const user = await getCurrentUser();
  const access = getFinanceAccess(user.role);

  if (!access.canViewProjects) {
    return (
      <PageShell>
        <AccessDenied description="Project tracking is limited to administrators and accountants." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ProjectsScreen
        initialProjects={getProjectRecords()}
        funds={getFundRecords()}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
