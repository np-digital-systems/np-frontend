import { can } from '@/features/auth/lib/permissions';
import type { Permission } from '@/features/auth/types/permission';

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

export function getFinanceAccess(granted: readonly Permission[]): FinanceAccess {
  return {
    canViewFunds: can(granted, 'fund:view'),
    canManageFunds: can(granted, 'fund:manage'),

    canViewProjects: can(granted, 'project:view'),
    canManageProjects: can(granted, 'project:manage'),

    canViewDeposits: can(granted, 'fixed-deposit:view'),
    canManageDeposits: can(granted, 'fixed-deposit:manage'),

    canViewAssets: can(granted, 'asset:view'),
    canManageAssets: can(granted, 'asset:manage'),
    canDisposeAssets: can(granted, 'asset:dispose'),

    canViewLedger: can(granted, 'transaction:view'),
  };
}

export const DEPOSIT_READ_ONLY_MESSAGE =
  'Only administrators can change deposits.';

export const ASSET_DISPOSE_MESSAGE =
  'Only administrators can dispose of assets.';
