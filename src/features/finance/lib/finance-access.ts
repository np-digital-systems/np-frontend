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
  'You can see the temple’s deposits, their maturities and the interest they earn. Placing, renewing or closing a deposit is restricted to administrators.';

export const ASSET_DISPOSE_MESSAGE =
  'You can add and amend asset records. Writing an asset off or recording its disposal is restricted to administrators.';
