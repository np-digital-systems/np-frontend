export { getCurrentUser, ROLE_PREVIEW_COOKIE } from './lib/session';

export {
  ROLE_PERMISSIONS,
  can,
  canAny,
  canAll,
  getPermissions,
} from './lib/permissions';

export {
  canAccessNavItem,
  getPortalNavigation,
} from './lib/navigation';

export { PERMISSIONS, type Permission } from './types/permission';
export { USER_ROLES, type UserRole } from './types/user-role';
export type { PortalUser } from './types/user';
