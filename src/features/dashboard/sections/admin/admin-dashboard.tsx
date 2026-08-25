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
  MONTHLY_DATA,
  QUARTERLY_DATA,
  YEARLY_DATA,
} from '../../constants/mock-data';
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

/**
 * Admin dashboard — oversight.
 *
 * An admin's job on this screen is to spot what needs a decision, so the
 * approvals queue sits beside the chart rather than below the fold, and the
 * quick actions are the five things only an admin can start.
 */
const QUICK_ACTIONS: readonly QuickAction[] = [
  { label: 'Create Event', href: EVENT_ROUTES.calendar, icon: CalendarPlus },
  { label: 'View Approvals', href: '/accounting/approvals', icon: CheckSquare },
  { label: 'View Transactions', href: '/accounting/transactions', icon: ArrowUpRight },
  { label: 'Create User', href: '/administration/users', icon: UserPlus },
  { label: 'Generate Report', href: '/accounting/reports', icon: FileText },
];

export function AdminDashboard({
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
        subtitle="Temple management overview"
      />

      <QuickActions actions={QUICK_ACTIONS} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Cash Balance"
          value={formatCurrency(125450)}
          caption="As of today"
          trend={{ value: '+₹5,450', direction: 'up', isPositive: true }}
        />
        <StatCard
          label="Bank Balance"
          value={formatCurrency(570000)}
          caption="2 accounts"
        />
        <StatCard
          label="Festival Fund"
          value={formatCurrency(320500)}
          caption={`FY ${financialYear.label}`}
          trend={{ value: '+12.4%', direction: 'up', isPositive: true }}
        />
        <StatCard
          label="Thiruppani Fund"
          value={formatCurrency(185200)}
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
              Monthly: MONTHLY_DATA,
              Quarterly: QUARTERLY_DATA,
              Yearly: YEARLY_DATA,
            }}
            summary={[
              { label: 'Total Income', value: 2465000, color: 'var(--chart-1)' },
              { label: 'Total Expenses', value: 1444000, color: 'var(--chart-5)' },
              { label: 'Net Balance', value: 1021000, color: 'var(--chart-2)' },
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
