import { createElement } from 'react';

import { getCurrentUser } from '@/features/auth/lib/session';

import {
  formatToday,
  getFinancialYear,
  getGreeting,
} from './lib/dashboard-data';
import { resolveDashboard } from './lib/dashboard-registry';

export async function DashboardFeature() {
  const [user, financialYear] = await Promise.all([
    getCurrentUser(),
    getFinancialYear(),
  ]);

  return createElement(resolveDashboard(user.role), {
    user,
    financialYear,
    greeting: getGreeting(),
    today: formatToday(),
  });
}
