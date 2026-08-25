import { can } from '@/features/auth/lib/permissions';
import type { UserRole } from '@/features/auth/types/user-role';

export interface FinanceAccess {
  readonly canViewFunds: boolean;
  readonly canManageFunds: boolean;

  readonly canViewProjects: boolean;
  readonly canManageProjects: boolean;

  readonly canViewDeposits: boolean;
  readonly canManageDeposits: boolean;

  readonly canViewAssets: boolean;
  readonly canManageAssets: boolean;
    readonly canDisposeAssets: boolean;

    readonly canViewLedger: boolean;
}

export function getFinanceAccess(role: UserRole): FinanceAccess {
  return {
    canViewFunds: can(role, 'fund:view'),
    canManageFunds: can(role, 'fund:manage'),

    canViewProjects: can(role, 'project:view'),
    canManageProjects: can(role, 'project:manage'),

    canViewDeposits: can(role, 'fixed-deposit:view'),
    canManageDeposits: can(role, 'fixed-deposit:manage'),

    canViewAssets: can(role, 'asset:view'),
    canManageAssets: can(role, 'asset:manage'),
    canDisposeAssets: can(role, 'asset:dispose'),

    canViewLedger: can(role, 'transaction:view'),
  };
}

export const DEPOSIT_READ_ONLY_MESSAGE =
  'You can see the temple’s deposits, their maturities and the interest they earn. Placing, renewing or closing a deposit is restricted to administrators.';

export const ASSET_DISPOSE_MESSAGE =
  'You can add and amend asset records. Writing an asset off or recording its disposal is restricted to administrators.';
