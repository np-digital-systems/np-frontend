'use client';

import Link from 'next/link';
import { Inbox } from 'lucide-react';

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  EmptyState,
  LinkButton,
  PeriodChart,
  PortalPageHeader,
  StatCard,
  StatusBadge,
  type PeriodPoint,
} from '@/components/portal/ui';
import { cn } from '@/lib/utils';

import { Amount } from '../../components/amount';
import type { AccountingAccess } from '../../lib/accounting-access';
import {
  codingSummary,
  formatCurrency,
  formatShortDate,
} from '../../lib/accounting-data';
import { ACCOUNTING_ROUTES } from '../../lib/routes';
import type {
  AccountingSummary,
  BankAccountRecord,
  FundPosition,
  IncomeStatement,
  LedgerRecord,
  VoucherRecord,
} from '../../types';

interface OverviewScreenProps {
  summary: AccountingSummary;
  funds: readonly FundPosition[];
  banks: readonly BankAccountRecord[];
  recent: readonly LedgerRecord[];
  pending: readonly VoucherRecord[];
  statement: IncomeStatement;
  monthly: readonly PeriodPoint[];
  quarterly: readonly PeriodPoint[];
  access: AccountingAccess;
  year: number;
}

export function OverviewScreen({
  summary,
  funds,
  banks,
  recent,
  pending,
  statement,
  monthly,
  quarterly,
  access,
  year,
}: OverviewScreenProps) {
  return (
    <>
      <PortalPageHeader
        title="Account Overview"
        description="Income, expenditure and fund position for the financial year, from posted entries only."
        meta={[
          <span key="year" className="tabular">
            Financial year {year}
          </span>,
          <span key="surplus" className="tabular">
            Surplus {formatCurrency(summary.surplus)}
          </span>,
          summary.pendingApprovals > 0 ? (
            <span key="pending" className="text-warning tabular">
              {summary.pendingApprovals} awaiting approval
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          access.canGenerateReports && (
            <LinkButton href={ACCOUNTING_ROUTES.reports}>
              Generate reports
            </LinkButton>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Income"
          value={formatCurrency(summary.income)}
          caption={`FY ${year}`}
        />
        <StatCard
          label="Total Expenditure"
          value={formatCurrency(summary.expenses)}
          caption={`FY ${year}`}
        />
        <StatCard
          label="Net Surplus"
          value={formatCurrency(summary.surplus)}
          caption="Income less expenditure"
          trend={{
            value: `${Math.round((summary.surplus / Math.max(summary.income, 1)) * 100)}%`,
            direction: summary.surplus >= 0 ? 'up' : 'down',
            isPositive: summary.surplus >= 0,
          }}
        />
        <StatCard
          label="Cash & Bank"
          value={formatCurrency(summary.cashBalance + summary.bankBalance)}
          caption={`${formatCurrency(summary.cashBalance)} in hand`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PeriodChart
            title="Income & Expenditure"
            variant="bar"
            periods={['Monthly', 'Quarterly'] as const}
            dataByPeriod={{ Monthly: monthly, Quarterly: quarterly }}
            summary={[
              {
                label: 'Total Income',
                value: summary.income,
                color: 'var(--chart-1)',
              },
              {
                label: 'Total Expenditure',
                value: summary.expenses,
                color: 'var(--chart-5)',
              },
              {
                label: 'Net Surplus',
                value: summary.surplus,
                color: 'var(--chart-2)',
              },
            ]}
          />
        </div>

        <PendingPanel pending={pending} access={access} summary={summary} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FundPanel funds={funds} />
        </div>

        <BankPanel banks={banks} total={summary.bankBalance} access={access} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <StatementPanel statement={statement} />
        <RecentPanel entries={recent} />
      </div>
    </>
  );
}

function PendingPanel({
  pending,
  access,
  summary,
}: {
  pending: readonly VoucherRecord[];
  access: AccountingAccess;
  summary: AccountingSummary;
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Awaiting Approval"
        description="Not yet part of any figure above"
        action={
          access.canApprove && (
            <LinkButton href={ACCOUNTING_ROUTES.approvals}>Review</LinkButton>
          )
        }
      />

      {pending.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nothing pending"
          description="Every submitted voucher has been decided."
        />
      ) : (
        <ul className="flex-1 divide-y divide-border">
          {pending.slice(0, 4).map((voucher) => (
            <li key={voucher.id} className="px-5 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="ref text-xs font-medium text-primary">
                    {voucher.ref}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-text-primary">
                    {voucher.party}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-text-muted">
                    {codingSummary(voucher).fund} · {voucher.createdBy.name}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <Amount
                    value={voucher.amount}
                    tone={voucher.kind === 'receipt' ? 'in' : 'out'}
                    className="text-[13px] font-semibold"
                  />
                  <p className="mt-1 text-[11px] text-text-muted tabular">
                    {formatShortDate(voucher.date)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CardFooter>
        <span className="text-xs text-text-muted tabular">
          {summary.pendingApprovals} pending ·{' '}
          {formatCurrency(summary.pendingAmount)}
        </span>

        {access.canApprove && (
          <LinkButton href={ACCOUNTING_ROUTES.approvals}>View all</LinkButton>
        )}
      </CardFooter>
    </Card>
  );
}

function FundPanel({ funds }: { funds: readonly FundPosition[] }) {
  return (
    <Card>
      <CardHeader
        title="Fund Position"
        description="Opening balance, movement and what remains"
      />

      <ul className="divide-y divide-border">
        {funds.map((fund) => (
          <li key={fund.id} className="px-5 py-4">
            <div className="flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-text-primary">
                  {fund.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-text-muted">
                  {fund.nameTa}
                </p>
              </div>

              <p className="shrink-0 text-[15px] font-semibold text-text-primary tabular">
                {formatCurrency(fund.balance)}
              </p>
            </div>

            <dl className="mt-2.5 flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <Figure label="Opening" value={fund.opening} tone="muted" />
              <Figure label="Income" value={fund.income} tone="in" />
              <Figure label="Expenditure" value={fund.expenses} tone="out" />
            </dl>

            <Utilisation fund={fund} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Figure({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'in' | 'out' | 'muted';
}) {
  return (
    <div>
      <dt className="text-[11px] text-text-muted">{label}</dt>
      <dd className="mt-0.5 text-xs font-semibold">
        <Amount value={value} tone={tone} />
      </dd>
    </div>
  );
}

function Utilisation({ fund }: { fund: FundPosition }) {
  const available = fund.opening + fund.income;
  const used = available === 0 ? 0 : Math.min(fund.expenses / available, 1);

  return (
    <div className="mt-3">
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-surface-2"
        role="img"
        aria-label={`${Math.round(used * 100)} percent of available funds spent`}
      >
        <div
          className={cn(
            'h-full rounded-full',
            used > 0.85 ? 'bg-warning' : 'bg-primary',
          )}
          style={{ width: `${Math.max(used * 100, 2)}%` }}
        />
      </div>

      <p className="mt-1.5 text-[11px] text-text-muted tabular">
        {Math.round(used * 100)}% of available funds spent
      </p>
    </div>
  );
}

function BankPanel({
  banks,
  total,
  access,
}: {
  banks: readonly BankAccountRecord[];
  total: number;
  access: AccountingAccess;
}) {
  const active = banks.filter((bank) => bank.isActive);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Bank Position"
        action={
          access.canViewBankAccounts && (
            <LinkButton href={ACCOUNTING_ROUTES.bankAccounts}>
              Accounts
            </LinkButton>
          )
        }
      />

      <CardBody className="flex-1">
        <p className="text-[11px] text-text-muted">Total across accounts</p>
        <p className="mt-1 text-xl font-semibold leading-none tracking-[-0.02em] text-text-primary tabular">
          {formatCurrency(total)}
        </p>

        <ul className="mt-4 space-y-2.5">
          {active.map((bank) => (
            <li
              key={bank.id}
              className="flex items-baseline justify-between gap-3"
            >
              <span className="min-w-0 truncate text-[13px] text-text-secondary">
                {bank.label}
              </span>
              <span className="shrink-0 text-[13px] font-medium text-text-primary tabular">
                {formatCurrency(bank.balance)}
              </span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

function StatementPanel({ statement }: { statement: IncomeStatement }) {
  return (
    <Card>
      <CardHeader
        title="Where the Money Comes From"
        description="Income by head, this financial year"
      />

      <CardBody>
        <ul className="space-y-3">
          {statement.income.slice(0, 6).map((line) => (
            <li key={line.account.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-[13px] text-text-primary">
                  {line.account.name}
                </span>
                <span className="shrink-0 text-[13px] font-medium text-text-primary tabular">
                  {formatCurrency(line.amount)}
                </span>
              </div>

              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-chart-2"
                  style={{ width: `${Math.max(line.share * 100, 2)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardBody>

      <CardFooter>
        <span className="text-xs text-text-muted">Total income</span>
        <span className="text-[13px] font-semibold text-success tabular">
          {formatCurrency(statement.totalIncome)}
        </span>
      </CardFooter>
    </Card>
  );
}

function RecentPanel({ entries }: { entries: readonly LedgerRecord[] }) {
  return (
    <Card>
      <CardHeader
        title="Recently Posted"
        action={
          <LinkButton href={ACCOUNTING_ROUTES.transactions}>
            View ledger
          </LinkButton>
        }
      />

      <ul className="divide-y divide-border">
        {entries.slice(0, 6).map((entry) => (
          <li key={entry.id}>
            <Link
              href={ACCOUNTING_ROUTES.transactions}
              className={cn(
                'flex items-start justify-between gap-3 px-5 py-3',
                'transition-colors hover:bg-interactive-hover',
                'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] text-text-primary">
                  {entry.description}
                </p>
                <p className="mt-0.5 truncate text-xs text-text-muted">
                  <span className="ref">{entry.ref}</span> · {entry.account.name}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <Amount
                  value={entry.credit ?? entry.debit}
                  tone={entry.credit ? 'in' : 'out'}
                  className="text-[13px] font-medium"
                />
                <p className="mt-0.5 text-[11px] text-text-muted tabular">
                  {formatShortDate(entry.date)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <CardFooter>
        <StatusBadge status="Posted" />
        <span className="text-xs text-text-muted">
          Only posted entries reach the ledger
        </span>
      </CardFooter>
    </Card>
  );
}
