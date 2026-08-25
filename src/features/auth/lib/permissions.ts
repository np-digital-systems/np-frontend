import type { Permission } from '@/features/auth/types/permission';
import type { UserRole } from '@/features/auth/types/user-role';

/**
 * Role → capability matrix.
 *
 * The single place that answers "what is this role allowed to do".
 * Keep it exhaustive: `satisfies` below fails the build if a role is added
 * to UserRole without being granted a capability set here.
 */
export const ROLE_PERMISSIONS = {
  admin: [
    'dashboard:view',
    'transaction:view',
    'transaction:create',
    'voucher:create',
    'voucher:submit',
    'voucher:approve',
    'cash-book:view',
    'bank-book:view',
    'fund:view',
    'fund:manage',
    'report:generate',
    'event:view',
    'event:manage',
    'user:manage',
    'audit:view',
    'settings:manage',
  ],

  accountant: [
    'dashboard:view',
    'transaction:view',
    'transaction:create',
    'voucher:create',
    'voucher:submit',
    'voucher:approve',
    'cash-book:view',
    'bank-book:view',
    'fund:view',
    'fund:manage',
    'report:generate',
    'event:view',
  ],

  // A cashier drafts and submits, but never approves its own work.
  cashier: [
    'dashboard:view',
    'transaction:view',
    'transaction:create',
    'voucher:create',
    'voucher:submit',
    'cash-book:view',
    'event:view',
  ],

  user: ['dashboard:view', 'event:view'],
} as const satisfies Record<UserRole, readonly Permission[]>;

export function getPermissions(role: UserRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function can(role: UserRole, permission: Permission): boolean {
  return (
    ROLE_PERMISSIONS[role] as readonly Permission[]
  ).includes(permission);
}

export function canAny(
  role: UserRole,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => can(role, permission));
}

export function canAll(
  role: UserRole,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => can(role, permission));
}
