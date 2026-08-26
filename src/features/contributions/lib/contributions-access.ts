import { can } from '@/features/auth/lib/permissions';
import type { Permission } from '@/features/auth/types/permission';

export interface ContributionAccess {
  readonly canView: boolean;
    readonly canRecord: boolean;
    readonly canManage: boolean;
    readonly canSeeContact: boolean;
}

export function getContributionAccess(granted: readonly Permission[]): ContributionAccess {
  const canManage = can(granted, 'contribution:manage');

  return {
    canView: can(granted, 'contribution:view'),
    canRecord: can(granted, 'contribution:record'),
    canManage,
    canSeeContact: canManage,
  };
}

export const REGISTER_READ_ONLY_MESSAGE =
  'You can see the register and record subscription payments. Adding or amending a member is restricted to administrators and accountants.';
