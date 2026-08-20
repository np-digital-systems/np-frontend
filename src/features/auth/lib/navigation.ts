import {
  portalNavigation,
  type PortalNavGroup,
  type PortalNavItem,
} from '@/config/navigation';

import type { UserRole } from '@/features/auth/types/user-role';

import { can } from './permissions';

/**
 * A destination is reachable when the role holds the capability the page
 * itself enforces. Items still pinned to a role list fall back to that, and
 * an item with neither gate is open to anyone who reached the portal.
 */
export function canAccessNavItem(
  item: PortalNavItem,
  role: UserRole,
): boolean {
  if (item.requiredPermission) {
    return can(role, item.requiredPermission);
  }

  if (!item.allowedRoles) {
    return true;
  }

  return item.allowedRoles.includes(role);
}

export function getPortalNavigation(
  role: UserRole,
): PortalNavGroup[] {
  return portalNavigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        canAccessNavItem(item, role),
      ),
    }))
    .filter((group) => group.items.length > 0);
}