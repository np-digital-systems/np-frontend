import Link from 'next/link';
import { CreditCard, Receipt } from 'lucide-react';

import { DashboardShell, PageHeader, StatCard } from '../../components';
import { formatCurrency } from '../../lib/dashboard-data';
import type { DashboardProps } from '../../types';
import { CashPosition } from '../shared';
import { EntryWorkflow } from './entry-workflow';
import { MyActivity } from './my-activity';
import { SubmissionsTable } from './submissions-table';

import { cn } from '@/lib/utils';

/**
 * Cashier dashboard — data entry.
 *
 * A cashier does two things all day, so those two get full-size primary
 * buttons instead of joining a row of small shortcuts. Everything else on
 * the page is about the status of work this cashier already submitted —
 * there is no approvals queue here, because this role cannot approve.
 */
export function CashierDashboard({
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
        subtitle="Receipts and payments"
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/accounting/receipts/new"
          className={cn(
            'inline-flex h-11 items-center justify-center gap-2 rounded-xl',
            'bg-primary px-6 text-[13px] font-semibold text-primary-foreground',
            'transition-colors hover:bg-primary-hover',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          )}
        >
          <Receipt className="size-4" aria-hidden />
          New Receipt
        </Link>

        <Link
          href="/accounting/payments/new"
          className={cn(
            'inline-flex h-11 items-center justify-center gap-2 rounded-xl',
            'border border-border bg-surface px-6',
            'text-[13px] font-semibold text-text-primary shadow-xs',
            'transition-colors hover:bg-interactive-hover',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          )}
        >
          <CreditCard className="size-4" aria-hidden />
          New Payment Voucher
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Today's Receipts"
          value={formatCurrency(35000)}
          trend={{ value: '+₹35,000', direction: 'up', isPositive: true }}
        />
        <StatCard label="Today's Payments" value={formatCurrency(12500)} />
        <StatCard label="Pending Approval" value="5" caption="My entries" />
        <StatCard
          label="Approved Today"
          value="8"
          trend={{ value: '+3 from yesterday', direction: 'up', isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <EntryWorkflow />
        </div>

        <div className="flex flex-col gap-5 lg:col-span-3">
          <CashPosition title="Today's Cash" closingLabel="Current Balance" />
          <MyActivity />
        </div>
      </div>

      <SubmissionsTable />
    </DashboardShell>
  );
}
