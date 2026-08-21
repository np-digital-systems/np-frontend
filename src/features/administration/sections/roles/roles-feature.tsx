import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';

import { getAdministrationAccess } from '../../lib/administration-access';
import { PERMISSION_GROUPS } from '../../lib/administration-data';
import { getRoleRecords } from '../../lib/administration-service';

import { RolesScreen } from './roles-screen';

/**
 * Roles boundary.
 *
 * The one screen that decides what every other role in the portal can reach,
 * so it is the admin's alone. The matrix it renders is read from the live
 * `ROLE_PERMISSIONS` constant rather than from a copy.
 */
export async function RolesFeature() {
  const user = await getCurrentUser();
  const access = getAdministrationAccess(user.role);

  if (!access.canManageRoles) {
    return (
      <PageShell>
        <AccessDenied description="Roles and permissions are limited to administrators." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <RolesScreen roles={getRoleRecords()} groups={PERMISSION_GROUPS} />
    </PageShell>
  );
}
