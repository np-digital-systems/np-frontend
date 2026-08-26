import {
  ArrowUpRight,
  CalendarPlus,
  CheckSquare,
  FileText,
  UserPlus,
} from 'lucide-react';

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
  getSeries,
} from '../../lib/dashboard-service';
import { formatCurrency } from '../../lib/dashboard-data';
import { EVENT_ROUTES } from '@/features/events/lib/routes';

import type { DashboardProps } from '../../types';
import {
  BankPosition,
  CashPosition,
  FundOverview,
  PeriodChart,
  RecentActivity,
  UpcomingEvents,
} from '../shared';
import { PendingApprovals } from './pending-approvals';

const QUICK_ACTIONS: readonly QuickAction[] = [
  { label: 'Create Event', href: EVENT_ROUTES.calendar, icon: CalendarPlus },
  { label: 'View Approvals', href: '/accounting/approvals', icon: CheckSquare },
  { label: 'View Transactions', href: '/accounting/transactions', icon: ArrowUpRight },
  { label: 'Create User', href: '/administration/users', icon: UserPlus },
  { label: 'Generate Report', href: '/accounting/reports', icon: FileText },
];

export async function AdminDashboard({
  user,
  greeting,
  today,
  financialYear,
}: DashboardProps) {
  const [summary, funds, series] = await Promise.all([
    getAccountingSummary(),
    getFundOverview(),
    getSeries(),
  ]);

  // The two largest funds, whichever the temple currently runs.
  const [firstFund, secondFund] = [...funds].sort((a, b) => b.balance - a.balance);

  return (
    <DashboardShell>
      <PageHeader
        user={user}
        greeting={greeting}
        today={today}
        financialYear={financialYear}
        subtitle="Temple management overview"
      />

      <QuickActions actions={QUICK_ACTIONS} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Cash Balance"
          value={formatCurrency(summary.cashBalance)}
          caption="As of today"
        />
        <StatCard
          label="Bank Balance"
          value={formatCurrency(summary.bankBalance)}
          caption={`${funds.length} fund${funds.length === 1 ? '' : 's'}`}
        />
        <StatCard
          label={firstFund?.name ?? 'Funds'}
          value={formatCurrency(firstFund?.balance ?? 0)}
          caption={`FY ${financialYear.label}`}
        />
        <StatCard
          label={secondFund?.name ?? 'Surplus'}
          value={formatCurrency(secondFund?.balance ?? summary.surplus)}
          caption={`FY ${financialYear.label}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PeriodChart
            title="Financial Overview"
            variant="bar"
            periods={['Monthly', 'Quarterly', 'Yearly'] as const}
            dataByPeriod={{
              Monthly: series.monthly,
              Quarterly: series.quarterly,
              Yearly: series.yearly,
            }}
            summary={[
              { label: 'Total Income', value: summary.income, color: 'var(--chart-1)' },
              { label: 'Total Expenses', value: summary.expenses, color: 'var(--chart-5)' },
              { label: 'Net Balance', value: summary.surplus, color: 'var(--chart-2)' },
            ]}
          />
        </div>

        <PendingApprovals />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FundOverview />
        </div>

        <div className="flex flex-col gap-5">
          <CashPosition />
          <BankPosition />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UpcomingEvents />
        <RecentActivity />
      </div>
    </DashboardShell>
  );
}
