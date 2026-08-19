import type { ComponentType } from 'react';

import type { UserRole } from '@/features/auth/types/user-role';

import {
  AccountantDashboard,
  AdminDashboard,
  CashierDashboard,
  MemberDashboard,
} from '../sections';
import type { DashboardProps } from '../types';

/**
 * Role → dashboard composition.
 *
 * Each role gets its OWN dashboard tree. The alternative — one page that
 * renders every role's widgets behind conditionals — means every role pays
 * to download and reason about every other role's UI, and it makes
 * "what does a cashier actually see?" unanswerable without reading the
 * whole component.
 *
 * Resolution happens once, on the server, at the feature boundary. Nothing
 * downstream re-checks the role to decide what to render.
 *
 * `satisfies` makes adding a role to `UserRole` without giving it a
 * dashboard a compile error rather than a runtime blank page.
 */
export const DASHBOARD_BY_ROLE = {
  admin: AdminDashboard,
  accountant: AccountantDashboard,
  cashier: CashierDashboard,
  user: MemberDashboard,
} as const satisfies Record<UserRole, ComponentType<DashboardProps>>;

export function resolveDashboard(
  role: UserRole,
): ComponentType<DashboardProps> {
  return DASHBOARD_BY_ROLE[role];
}
