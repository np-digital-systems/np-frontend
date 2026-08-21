import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getToday } from '@/lib/format';

import { getAdministrationAccess } from '../../lib/administration-access';
import { getAuditEntries } from '../../lib/administration-service';

import { AuditLogScreen } from './audit-log-screen';

/**
 * Audit log boundary.
 *
 * `audit:view` is the admin's alone. The trail records what everybody else
 * did, including who changed whose permissions, so anyone who could read it
 * selectively could also learn where the gaps in oversight are.
 */
export async function AuditLogFeature() {
  const user = await getCurrentUser();
  const access = getAdministrationAccess(user.role);

  if (!access.canViewAudit) {
    return (
      <PageShell>
        <AccessDenied description="The audit log is limited to administrators." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AuditLogScreen entries={getAuditEntries()} today={getToday()} />
    </PageShell>
  );
}
