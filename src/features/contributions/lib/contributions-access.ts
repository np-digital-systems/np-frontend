import { can } from '@/features/auth/lib/permissions';
import type { UserRole } from '@/features/auth/types/user-role';

/**
 * What the signed-in role may do on the Sanththa register.
 *
 * The split that matters here is between taking money and deciding who is on
 * the register: a cashier does the first every day at the counter and never
 * the second.
 */
export interface ContributionAccess {
  readonly canView: boolean;
  /** Take a subscription payment and issue its receipt. */
  readonly canRecord: boolean;
  /** Add, amend or lapse a member on the register. */
  readonly canManage: boolean;
  /** Contact details belong to whoever keeps the register. */
  readonly canSeeContact: boolean;
}

export function getContributionAccess(role: UserRole): ContributionAccess {
  const canManage = can(role, 'contribution:manage');

  return {
    canView: can(role, 'contribution:view'),
    canRecord: can(role, 'contribution:record'),
    canManage,
    canSeeContact: canManage,
  };
}

export const REGISTER_READ_ONLY_MESSAGE =
  'You can see the register and record subscription payments. Adding or amending a member is restricted to administrators and accountants.';
