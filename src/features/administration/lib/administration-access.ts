import { can } from '@/features/auth/lib/permissions';
import type { Permission } from '@/features/auth/types/permission';

export interface AdministrationAccess {
  readonly canManageUsers: boolean;
  readonly canManageRoles: boolean;
  readonly canViewAudit: boolean;

  readonly canViewFinancialYears: boolean;
    readonly canManageFinancialYears: boolean;

  readonly canManageSettings: boolean;
}

export function getAdministrationAccess(
  granted: readonly Permission[],
): AdministrationAccess {
  return {
    canManageUsers: can(granted, 'user:manage'),
    canManageRoles: can(granted, 'role:manage'),
    canViewAudit: can(granted, 'audit:view'),

    canViewFinancialYears: can(granted, 'financial-year:view'),
    canManageFinancialYears: can(granted, 'financial-year:manage'),

    canManageSettings: can(granted, 'settings:manage'),
  };
}

export const FINANCIAL_YEAR_READ_ONLY_MESSAGE =
  'Only administrators can open or close financial years.';
