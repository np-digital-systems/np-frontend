import { createElement } from 'react';

import { getCurrentUser } from '@/features/auth/lib/session';

import {
  formatToday,
  getFinancialYear,
  getGreeting,
} from './lib/dashboard-data';
import { resolveDashboard } from './lib/dashboard-registry';

export async function DashboardFeature() {
  const user = await getCurrentUser();

  return createElement(resolveDashboard(user.role), {
    user,
    financialYear: getFinancialYear(),
    greeting: getGreeting(),
    today: formatToday(),
  });
}
