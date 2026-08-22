import { can } from '@/features/auth/lib/permissions';
import type { UserRole } from '@/features/auth/types/user-role';

export interface ContributionAccess {
  readonly canView: boolean;
    readonly canRecord: boolean;
    readonly canManage: boolean;
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
