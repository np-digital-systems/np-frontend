import {
  portalNavigation,
  type PortalNavGroup,
  type PortalNavItem,
} from '@/config/navigation';

import type { Permission } from '@/features/auth/types/permission';
import type { UserRole } from '@/features/auth/types/user-role';

import { can } from './permissions';

export function canAccessNavItem(
  item: PortalNavItem,
  granted: readonly Permission[],
  role: UserRole,
): boolean {
  if (item.requiredPermission) {
    return can(granted, item.requiredPermission);
  }

  if (!item.allowedRoles) {
    return true;
  }

  return item.allowedRoles.includes(role);
}

/**
 * The navigation this session can reach.
 *
 * Built from the permissions the server granted, so a role an administrator
 * re-scopes changes the menu on the next sign-in without a redeploy.
 */
export function getPortalNavigation(
  granted: readonly Permission[],
  role: UserRole,
): PortalNavGroup[] {
  return portalNavigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessNavItem(item, granted, role)),
    }))
    .filter((group) => group.items.length > 0);
}
