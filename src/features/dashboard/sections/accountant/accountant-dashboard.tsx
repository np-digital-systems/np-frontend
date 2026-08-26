import { BookOpen, CreditCard, FileText, Receipt } from 'lucide-react';

import {
  DashboardShell,
  PageHeader,
  QuickActions,
  StatCard,
  type QuickAction,
} from '../../components';
import {
  getAccountingSummary,
  getFundOverview,
  getQueueSplit,
  getSeries,
} from '../../lib/dashboard-service';
import { formatCurrency } from '../../lib/dashboard-data';
import type { DashboardProps } from '../../types';
import {
  BankPosition,
  CashPosition,
  PeriodChart,
  TransactionsTable,
  UpcomingEvents,
} from '../shared';
import { ApprovalQueue } from './approval-queue';
import { FundSummary } from './fund-summary';

const QUICK_ACTIONS: readonly QuickAction[] = [
  { label: 'New Receipt', href: '/accounting/receipts?new=1', icon: Receipt },
  { label: 'New Payment', href: '/accounting/payments?new=1', icon: CreditCard },
  { label: 'Cash Book', href: '/accounting/cash-book', icon: BookOpen },
  { label: 'Generate Report', href: '/accounting/reports', icon: FileText },
];

export async function AccountantDashboard({
  user,
  greeting,
  today,
  financialYear,
}: DashboardProps) {
  const [summary, funds, split, series] = await Promise.all([
    getAccountingSummary(),
    getFundOverview(),
    getQueueSplit(),
    getSeries(),
  ]);

  const thisMonth = series.monthly.at(-1);

  return (
    <DashboardShell>
      <PageHeader
        user={user}
        greeting={greeting}
        today={today}
        financialYear={financialYear}
        subtitle="Accounting overview"
      />

      <QuickActions actions={QUICK_ACTIONS} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Cash Balance" value={formatCurrency(summary.cashBalance)} caption="As of today" />
        <StatCard
          label="Bank Balance"
          value={formatCurrency(summary.bankBalance)}
          caption={`${funds.length} fund${funds.length === 1 ? '' : 's'}`}
        />
        <StatCard label="Income" value={formatCurrency(summary.income)} caption={`FY ${financialYear.label}`} />
        <StatCard label="Expenses" value={formatCurrency(summary.expenses)} caption={`FY ${financialYear.label}`} />
        <StatCard
          label="Pending Approvals"
          value={String(summary.pendingApprovals)}
          caption={`${split.receipts} receipt${split.receipts === 1 ? '' : 's'} · ${split.payments} payment${split.payments === 1 ? '' : 's'}`}
        />
        <StatCard
          label="This Month Net"
          value={formatCurrency((thisMonth?.income ?? 0) - (thisMonth?.expenses ?? 0))}
          caption={thisMonth?.label ?? '—'}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PeriodChart
            title="Income vs Expenses"
            variant="area"
            periods={['This Month', 'Last Month', 'This Year'] as const}
            dataByPeriod={{
              'This Month': thisMonth ? [thisMonth] : [],
              'Last Month': series.monthly.slice(-2, -1),
              'This Year': series.monthly,
            }}
            height={260}
          />
        </div>

        <div className="lg:col-span-2">
          <CashPosition title="Cash Book" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ApprovalQueue />
        <BankPosition title="Bank Accounts" showLink />
      </div>

      <TransactionsTable />

      <FundSummary />

      <UpcomingEvents />
    </DashboardShell>
  );
}
