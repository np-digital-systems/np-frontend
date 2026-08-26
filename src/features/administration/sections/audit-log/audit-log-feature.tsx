import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getToday } from '@/lib/format';

import { getAdministrationAccess } from '../../lib/administration-access';
import { getAuditEntries } from '../../lib/administration-service';

import { AuditLogScreen } from './audit-log-screen';

export async function AuditLogFeature() {
  const { permissions } = await requireSession();
  const access = getAdministrationAccess(permissions);

  if (!access.canViewAudit) {
    return (
      <PageShell>
        <AccessDenied description="The audit log is limited to administrators." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AuditLogScreen entries={(await getAuditEntries())} today={getToday()} />
    </PageShell>
  );
}
