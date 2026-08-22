import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { getAccountingAccess } from '../../lib/accounting-access';
import {
  getFundPositions,
  getIncomeStatement,
  getTrialBalance,
} from '../../lib/accounting-service';

import { ReportsScreen } from './reports-screen';

export async function ReportsFeature() {
  const user = await getCurrentUser();
  const access = getAccountingAccess(user.role);

  if (!access.canGenerateReports) {
    return (
      <PageShell>
        <AccessDenied description="Generating statements and registers is limited to administrators and accountants." />
      </PageShell>
    );
  }

  const today = getToday();

  return (
    <PageShell>
      <ReportsScreen
        statement={getIncomeStatement()}
        trialBalance={getTrialBalance()}
        funds={getFundPositions()}
        year={getActiveYear(today)}
        throughMonth={Number(today.slice(5, 7))}
      />
    </PageShell>
  );
}
