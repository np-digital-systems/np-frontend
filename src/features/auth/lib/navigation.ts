import type { UserRole } from '@/features/auth/types/user-role';

import type {
  PortalNavGroup,
  PortalNavItem,
} from '@/config/navigation';

export function canAccessNavigationItem(
  item: PortalNavItem,
  role: UserRole,
): boolean {
  if (!item.allowedRoles || item.allowedRoles.length === 0) {
    return true;
  }

  return item.allowedRoles.includes(role);
}

export function getVisiblePortalNavigation(
  navigation: PortalNavGroup[],
  role: UserRole,
): PortalNavGroup[] {
  return navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        canAccessNavigationItem(item, role),
      ),
    }))
    .filter((group) => group.items.length > 0);
}