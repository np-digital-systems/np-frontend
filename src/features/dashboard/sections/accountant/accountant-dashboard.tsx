import { BookOpen, CreditCard, FileText, Receipt } from 'lucide-react';

import {
  DashboardShell,
  PageHeader,
  QuickActions,
  StatCard,
  type QuickAction,
} from '../../components';
import {
  LAST_MONTH_DATA,
  MONTHLY_DATA,
  THIS_MONTH_DATA,
} from '../../constants/mock-data';
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
  { label: 'New Receipt', href: '/accounting/receipts', icon: Receipt },
  { label: 'New Payment', href: '/accounting/payments', icon: CreditCard },
  { label: 'Cash Book', href: '/accounting/cash-book', icon: BookOpen },
  { label: 'Generate Report', href: '/accounting/reports', icon: FileText },
];

export function AccountantDashboard({
  user,
  greeting,
  today,
  financialYear,
}: DashboardProps) {
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
        <StatCard label="Cash Balance" value={formatCurrency(125450)} caption="As of today" />
        <StatCard label="Bank Balance" value={formatCurrency(570000)} caption="2 accounts" />
        <StatCard
          label="Today's Income"
          value={formatCurrency(35000)}
          trend={{ value: '+18.2%', direction: 'up', isPositive: true }}
        />
        <StatCard
          label="Today's Expenses"
          value={formatCurrency(18500)}
          trend={{ value: '+4.1%', direction: 'up', isPositive: false }}
        />
        <StatCard label="Pending Approvals" value="8" caption="5 receipts · 3 payments" />
        <StatCard
          label="Monthly Net"
          value={formatCurrency(125200)}
          trend={{ value: '+12.4%', direction: 'up', isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PeriodChart
            title="Income vs Expenses"
            variant="area"
            periods={['This Month', 'Last Month', 'This Year'] as const}
            dataByPeriod={{
              'This Month': THIS_MONTH_DATA,
              'Last Month': LAST_MONTH_DATA,
              'This Year': MONTHLY_DATA,
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
