import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
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

export async function AccountOverviewFeature() {
  const { permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canViewOverview) {
    return (
      <PageShell>
        <AccessDenied description="The financial overview is limited to administrators and accountants. The cash book and voucher registers cover day-to-day work." />
      </PageShell>
    );
  }

  const today = getToday();

  const [
    summary,
    funds,
    banks,
    recent,
    pending,
    statement,
    monthly,
    quarterly,
  ] = await Promise.all([
    getSummary(),
    getFundPositions(),
    getBankAccountRecords(),
    getLedger(),
    getPendingVouchers(),
    getIncomeStatement(),
    getMonthlySeries(today),
    getQuarterlySeries(today),
  ]);

  return (
    <PageShell>
      <OverviewScreen
        summary={summary}
        funds={funds}
        banks={banks}
        recent={recent}
        pending={pending}
        statement={statement}
        monthly={monthly}
        quarterly={quarterly}
        access={access}
        year={getActiveYear(today)}
      />
    </PageShell>
  );
}
