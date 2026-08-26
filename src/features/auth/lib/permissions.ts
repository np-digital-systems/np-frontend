import type { Permission } from '@/features/auth/types/permission';

/**
 * Capability checks against the permissions the server granted this session.
 *
 * The role → capability matrix now lives in the database and is served with the
 * session, so a role whose permissions an administrator edits takes effect
 * without a redeploy. These helpers only ask whether a permission is present.
 */
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
