import {
  portalNavigation,
  type PortalNavGroup,
  type PortalNavItem,
} from '@/config/navigation';

import type { UserRole } from '@/features/auth/types/user-role';

import { can } from './permissions';

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