import { can } from '@/features/auth/lib/permissions';
import type { UserRole } from '@/features/auth/types/user-role';

/**
 * What the signed-in role may do on the administration screens.
 *
 * Almost all of this is the admin's alone — these screens decide what every
 * other role in the portal can do — with one exception: an accountant reads
 * the financial year because it is the boundary of the books they keep.
 */
export interface AdministrationAccess {
  readonly canManageUsers: boolean;
  readonly canManageRoles: boolean;
  readonly canViewAudit: boolean;

  readonly canViewFinancialYears: boolean;
  /** Opening and closing a year is irreversible and locks the books. */
  readonly canManageFinancialYears: boolean;

  readonly canManageSettings: boolean;
}

export function getAdministrationAccess(
  role: UserRole,
): AdministrationAccess {
  return {
    canManageUsers: can(role, 'user:manage'),
    canManageRoles: can(role, 'role:manage'),
    canViewAudit: can(role, 'audit:view'),

    canViewFinancialYears: can(role, 'financial-year:view'),
    canManageFinancialYears: can(role, 'financial-year:manage'),

    canManageSettings: can(role, 'settings:manage'),
  };
}

export const FINANCIAL_YEAR_READ_ONLY_MESSAGE =
  'You can see the temple’s financial years and their totals. Opening a new year or closing the current one is restricted to administrators.';
