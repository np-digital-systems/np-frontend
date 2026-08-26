export {
  getCurrentUser,
  getSession,
  requireSession,
  getPermissions,
  createSession,
  destroySession,
  type PortalSession,
} from './lib/session';

export { signIn, signOut } from './lib/auth-actions';

export {
  can,
  canAny,
  canAll,
} from './lib/permissions';

export {
  canAccessNavItem,
  getPortalNavigation,
} from './lib/navigation';

export { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_PRESENTATION } from './lib/auth-data';
export { getRoleOptions } from './lib/auth-service';
export { AUTH_ROUTES } from './lib/auth-routes';
export { signInSchema, type SignInInput } from './lib/auth-schemas';

export { SignInFeature } from './sections';

export { PERMISSIONS, type Permission } from './types/permission';
export { USER_ROLES, type UserRole } from './types/user-role';
export type { PortalUser } from './types/user';
export type { AuthRoleIcon, AuthRoleOption, SignInState } from './types/auth';
