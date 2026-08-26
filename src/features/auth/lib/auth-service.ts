import type { AuthRoleOption } from '../types/auth';
import { USER_ROLES } from '../types/user-role';

import { ROLE_LABELS, ROLE_PRESENTATION } from './auth-data';

/**
 * What the sign-in screen describes.
 *
 * Presentation only: the role comes back with the session, from the account the
 * credentials belong to. Nothing chosen on this page decides what the portal
 * then allows.
 */
export function getRoleOptions(): readonly AuthRoleOption[] {
  return USER_ROLES.map((role) => ({
    role,
    label: ROLE_LABELS[role],
    summary: ROLE_PRESENTATION[role].summary,
    icon: ROLE_PRESENTATION[role].icon,
    highlights: ROLE_PRESENTATION[role].highlights,
  }));
}
