import {
  portalNavigation,
  type PortalNavGroup,
  type PortalNavItem,
} from '@/config/navigation';

import type { UserRole } from '@/features/auth/types/user-role';

export function canAccessNavItem(
  item: PortalNavItem,
  role: UserRole,
): boolean {
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