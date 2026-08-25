import type { ComponentType } from 'react';

import type { UserRole } from '@/features/auth/types/user-role';

import {
  AccountantDashboard,
  AdminDashboard,
  CashierDashboard,
  MemberDashboard,
} from '../sections';
import type { DashboardProps } from '../types';

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
