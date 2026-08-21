import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import {
  getBankAccountRecords,
  getFundPositions,
  getIncomeStatement,
  getLedger,
  getMonthlySeries,
  getPendingVouchers,
  getQuarterlySeries,
  getSummary,
} from '../../lib/accounting-service';

import { OverviewScreen } from './overview-screen';

/**
 * Account overview boundary.
 *
 * Gated on `fund:view` — the capability that says a role is trusted with the
 * temple's overall financial position rather than just its own day's work.
 * A cashier holds the cash book and the registers, not this.
 */
export async function AccountOverviewFeature() {
  const user = await getCurrentUser();
  const access = getAccountingAccess(user.role);

  if (!access.canViewOverview) {
    return (
      <PageShell>
        <AccessDenied description="The financial overview is limited to administrators and accountants. The cash book and voucher registers cover day-to-day work." />
      </PageShell>
    );
  }

  const today = getToday();

  return (
    <PageShell>
      <OverviewScreen
        summary={getSummary()}
        funds={getFundPositions()}
        banks={getBankAccountRecords()}
        recent={getLedger()}
        pending={getPendingVouchers()}
        statement={getIncomeStatement()}
        monthly={getMonthlySeries(today)}
        quarterly={getQuarterlySeries(today)}
        access={access}
        year={getActiveYear(today)}
      />
    </PageShell>
  );
}
