import type { AuthRoleOption } from '../types/auth';
import { USER_ROLES } from '../types/user-role';

import { ROLE_LABELS, ROLE_PRESENTATION } from './auth-data';

// Presentation only; the real role comes from the account after sign-in.
export function getRoleOptions(): readonly AuthRoleOption[] {
  return USER_ROLES.map((role) => ({
    role,
    label: ROLE_LABELS[role],
    summary: ROLE_PRESENTATION[role].summary,
    icon: ROLE_PRESENTATION[role].icon,
    highlights: ROLE_PRESENTATION[role].highlights,
  }));
}
