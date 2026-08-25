import { can } from '@/features/auth/lib/permissions';
import type { UserRole } from '@/features/auth/types/user-role';

/**
 * What the signed-in role may do on the financial management screens.
 *
 * Resolved once, on the server, at each page boundary and passed down as
 * plain booleans. The line these draw is the same one the accounting module
 * draws: keeping the books is the accountant's work, committing the temple's
 * money or parting with its property is the administrator's.
 */
export interface FinanceAccess {
  readonly canViewFunds: boolean;
  readonly canManageFunds: boolean;

  readonly canViewProjects: boolean;
  readonly canManageProjects: boolean;

  readonly canViewDeposits: boolean;
  readonly canManageDeposits: boolean;

  readonly canViewAssets: boolean;
  readonly canManageAssets: boolean;
  /** Writing an asset off is a step beyond keeping its record. */
  readonly canDisposeAssets: boolean;

  /** Ledger drill-downs are only offered to roles that may read the ledger. */
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
