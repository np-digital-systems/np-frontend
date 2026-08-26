import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import {
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
        <AccessDenied description="Generating statements and registers is limited to administrators and accountants." />
      </PageShell>
    );
  }

  const today = getToday();

  const [
    statement,
    trialBalance,
    funds,
  ] = await Promise.all([
    getIncomeStatement(),
    getTrialBalance(),
    getFundPositions(),
  ]);

  return (
    <PageShell>
      <ReportsScreen
        statement={statement}
        trialBalance={trialBalance}
        funds={funds}
        year={getActiveYear(today)}
        throughMonth={Number(today.slice(5, 7))}
      />
    </PageShell>
  );
}
