import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';

import { getAdministrationAccess } from '../../lib/administration-access';
import { PERMISSION_GROUPS } from '../../lib/administration-data';
import { getRoleRecords } from '../../lib/administration-service';

import { RolesScreen } from './roles-screen';

export async function RolesFeature() {
  const { permissions } = await requireSession();
  const access = getAdministrationAccess(permissions);

  if (!access.canManageRoles) {
    return (
      <PageShell>
        <AccessDenied description="Roles and permissions are limited to administrators." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <RolesScreen roles={(await getRoleRecords())} groups={PERMISSION_GROUPS} />
    </PageShell>
  );
}
