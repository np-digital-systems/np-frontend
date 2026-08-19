import { createElement } from 'react';

import { getCurrentUser } from '@/features/auth/lib/session';

import {
  formatToday,
  getFinancialYear,
  getGreeting,
} from './lib/dashboard-data';
import { resolveDashboard } from './lib/dashboard-registry';

/**
 * Dashboard feature boundary.
 *
 * A server component: identity is resolved here, the matching role dashboard
 * is selected here, and only that one tree is ever sent to the browser.
 *
 * `createElement` rather than `<Dashboard />` because the lint rule that
 * guards against components being *constructed* during render cannot tell
 * that this one is only being *looked up* from a module-level registry.
 */
export async function DashboardFeature() {
  const user = await getCurrentUser();

  return createElement(resolveDashboard(user.role), {
    user,
    financialYear: getFinancialYear(),
    greeting: getGreeting(),
    today: formatToday(),
  });
}
