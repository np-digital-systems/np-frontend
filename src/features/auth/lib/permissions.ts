import type { Permission } from '@/features/auth/types/permission';

// Permissions come from the session (stored in the database), so role edits apply without a redeploy.
export function can(
  granted: readonly Permission[],
  permission: Permission,
): boolean {
  return granted.includes(permission);
}

export function canAny(
  granted: readonly Permission[],
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => granted.includes(permission));
}

export function canAll(
  granted: readonly Permission[],
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => granted.includes(permission));
}
