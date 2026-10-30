import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import {
  getBalanceSheet,
  getFundPositions,
  getIncomeStatement,
  getTrialBalance,
} from '../../lib/accounting-service';

import { ReportsScreen } from './reports-screen';

export async function ReportsFeature() {
  const { permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canGenerateReports) {
    return (
      <PageShell>
        <AccessDenied description="Only administrators and accountants have access." />
      </PageShell>
    );
  }

  const today = getToday();

  const [
    statement,
    trialBalance,
    balanceSheet,
    funds,
  ] = await Promise.all([
    getIncomeStatement(),
    getTrialBalance(),
    getBalanceSheet(),
    getFundPositions(),
  ]);

  return (
    <PageShell>
      <ReportsScreen
        statement={statement}
        trialBalance={trialBalance}
        balanceSheet={balanceSheet}
        funds={funds}
        year={getActiveYear(today)}
        throughMonth={Number(today.slice(5, 7))}
      />
    </PageShell>
  );
}
