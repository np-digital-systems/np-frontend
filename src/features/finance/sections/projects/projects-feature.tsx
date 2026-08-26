import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getFinanceAccess } from '../../lib/finance-access';
import { getFundRecords, getProjectRecords } from '../../lib/finance-service';

import { ProjectsScreen } from './projects-screen';

export async function ProjectsFeature() {
  const { permissions } = await requireSession();
  const access = getFinanceAccess(permissions);

  if (!access.canViewProjects) {
    return (
      <PageShell>
        <AccessDenied description="Project tracking is limited to administrators and accountants." />
      </PageShell>
    );
  }

  const [
    initialProjects,
    funds,
  ] = await Promise.all([
    getProjectRecords(),
    getFundRecords(),
  ]);

  return (
    <PageShell>
      <ProjectsScreen
        initialProjects={initialProjects}
        funds={funds}
        access={access}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
