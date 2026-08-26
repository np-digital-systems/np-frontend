import Link from 'next/link';
import { CreditCard, Receipt } from 'lucide-react';

import { DashboardShell, PageHeader, StatCard } from '../../components';
import { getMyVoucherCounts } from '../../lib/dashboard-service';
import { formatCurrency } from '../../lib/dashboard-data';
import type { DashboardProps } from '../../types';
import { CashPosition } from '../shared';
import { EntryWorkflow } from './entry-workflow';
import { MyActivity } from './my-activity';
import { SubmissionsTable } from './submissions-table';

import { cn } from '@/lib/utils';

export async function CashierDashboard({
  user,
  greeting,
  today,
  financialYear,
}: DashboardProps) {
  const mine = await getMyVoucherCounts();

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
          href="/accounting/receipts?new=1"
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
          href="/accounting/payments?new=1"
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
        <StatCard label="My Receipts" value={formatCurrency(mine.receipts)} caption="This year" />
        <StatCard label="My Payments" value={formatCurrency(mine.payments)} caption="This year" />
        <StatCard label="Pending Approval" value={String(mine.pending)} caption="My entries" />
        <StatCard label="Approved" value={String(mine.settled)} caption="My entries" />
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
