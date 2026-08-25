import { PORTAL_ACCOUNTS } from '../constants/portal-accounts';
import type { AuthRoleOption } from '../types/auth';
import { USER_ROLES } from '../types/user-role';

import { ROLE_LABELS, ROLE_PRESENTATION } from './auth-data';
import { getPermissions } from './permissions';

/**
 * What the sign-in screen offers. The capability count is read from the same
 * matrix the portal enforces, so the promise made on the login page and the
 * navigation the shell builds can never drift apart.
 */
export function getRoleOptions(): readonly AuthRoleOption[] {
  return USER_ROLES.map((role) => ({
    role,
    label: ROLE_LABELS[role],
    summary: ROLE_PRESENTATION[role].summary,
    icon: ROLE_PRESENTATION[role].icon,
    highlights: ROLE_PRESENTATION[role].highlights,
    capabilityCount: getPermissions(role).length,
    demoEmail: PORTAL_ACCOUNTS[role].email,
  }));
}
