'use client';

import { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Download,
  FileText,
  Landmark,
  ListTree,
  Scale,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DataCell,
  DataRow,
  DataTable,
  PortalPageHeader,
  StatCard,
  type DataColumn,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { Amount } from '../../components/amount';
import { AccountTypeBadge } from '../../components/account-type-badge';
import { formatCurrency, monthName } from '../../lib/accounting-data';
import type {
  FundPosition,
  IncomeStatement,
  TrialBalanceRow,
} from '../../types';

interface ReportsScreenProps {
  statement: IncomeStatement;
  trialBalance: readonly TrialBalanceRow[];
  funds: readonly FundPosition[];
  year: number;
  /** Months with posted activity, so the period picker offers real choices. */
  throughMonth: number;
}

interface ReportDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: LucideIcon;
}

/**
 * The catalogue of statements the temple actually files.
 *
 * Listing them explicitly — rather than offering a generic "export" — is
 * what makes this screen useful to a treasurer who has to produce a specific
 * document for a specific audience.
 */
const REPORTS: readonly ReportDefinition[] = [
  {
    id: 'income-expenditure',
    name: 'Income & Expenditure',
    description: 'Every income and expenditure head with its total, and the resulting surplus.',
    icon: BarChart3,
  },
  {
    id: 'trial-balance',
    name: 'Trial Balance',
    description: 'Debit and credit totals per account, proving the ledger balances.',
    icon: Scale,
  },
  {
    id: 'fund-summary',
    name: 'Fund-wise Summary',
    description: 'Opening, income, expenditure and closing balance for each fund.',
    icon: Wallet,
  },
  {
    id: 'cash-book',
    name: 'Cash Book Statement',
    description: 'Day-wise cash receipts and payments with the running balance.',
    icon: BookOpen,
  },
  {
    id: 'bank-book',
    name: 'Bank Book Statement',
    description: 'Per-account deposits and withdrawals for reconciliation.',
    icon: Landmark,
  },
  {
    id: 'donation-register',
    name: 'Donation Register',
    description: 'Every donation received, by donor, for acknowledgement letters.',
    icon: FileText,
  },
  {
    id: 'sponsorship-report',
    name: 'Sponsorship Report',
    description: 'Pooja and festival sponsorships matched against the event calendar.',
    icon: FileText,
  },
  {
    id: 'ledger-extract',
    name: 'Account Ledger Extract',
    description: 'Full posting history for a single account over a chosen period.',
    icon: ListTree,
  },
];

/**
 * Statements and registers.
 *
 * Two of them — income & expenditure and the trial balance — are rendered
 * inline rather than only offered as a download, because they are the two a
 * treasurer checks constantly and downloading a file to read a total is
 * friction with no purpose.
 */
export function ReportsScreen({
  statement,
  trialBalance,
  funds,
  year,
  throughMonth,
}: ReportsScreenProps) {
  const [period, setPeriod] = useState<string>('year');

  const periodLabel =
    period === 'year' ? `Full year ${year}` : `${monthName(Number(period))} ${year}`;

  const balanced =
    Math.abs(
      trialBalance.reduce((sum, row) => sum + row.debit - row.credit, 0),
    ) < 1;

  return (
    <>
      <PortalPageHeader
        title="Reports"
        description="Statements and registers for the temple’s committee, auditors and donors."
        meta={[
          <span key="year" className="tabular">
            Financial year {year}
          </span>,
          <span key="period" className="tabular">
            {periodLabel}
          </span>,
        ]}
        actions={
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger aria-label="Reporting period">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="year">Full year {year}</SelectItem>

              {Array.from({ length: throughMonth }, (_, index) => (
                <SelectItem key={index + 1} value={String(index + 1)}>
                  {monthName(index + 1)} {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Income"
          value={formatCurrency(statement.totalIncome)}
          caption={`FY ${year}`}
        />
        <StatCard
          label="Total Expenditure"
          value={formatCurrency(statement.totalExpenses)}
          caption={`FY ${year}`}
        />
        <StatCard
          label="Surplus"
          value={formatCurrency(statement.surplus)}
          caption="Carried to reserves"
        />
        <StatCard
          label="Trial Balance"
          value={balanced ? 'Balanced' : 'Out'}
          caption={`${trialBalance.length} accounts posted`}
        />
      </div>

      <Tabs defaultValue="statement">
        <TabsList>
          <TabsTrigger value="statement">Income &amp; Expenditure</TabsTrigger>
          <TabsTrigger value="trial">Trial Balance</TabsTrigger>
          <TabsTrigger value="funds">Fund Summary</TabsTrigger>
          <TabsTrigger value="catalogue">All Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="statement">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <StatementSide
              title="Income"
              lines={statement.income}
              total={statement.totalIncome}
              tone="in"
            />
            <StatementSide
              title="Expenditure"
              lines={statement.expenses}
              total={statement.totalExpenses}
              tone="out"
            />
          </div>

          <Card className="mt-4">
            <CardBody className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold text-text-primary">
                  Surplus for the year
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Income less expenditure, carried to accumulated surplus
                </p>
              </div>

              <p
                className={cn(
                  'text-xl font-semibold tracking-[-0.02em] tabular',
                  statement.surplus >= 0 ? 'text-success' : 'text-danger',
                )}
              >
                {formatCurrency(statement.surplus)}
              </p>
            </CardBody>
          </Card>
        </TabsContent>

        <TabsContent value="trial">
          <TrialBalanceTable rows={trialBalance} balanced={balanced} />
        </TabsContent>

        <TabsContent value="funds">
          <FundSummaryTable funds={funds} />
        </TabsContent>

        <TabsContent value="catalogue">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {REPORTS.map((report) => (
              <Card key={report.id} className="flex flex-col">
                <CardBody className="flex flex-1 flex-col gap-3">
                  <div
                    className="flex size-9 items-center justify-center rounded-lg bg-primary-subtle"
                    aria-hidden
                  >
                    <report.icon className="size-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold text-text-primary">
                      {report.name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-text-muted">
                      {report.description}
                    </p>
                  </div>
                </CardBody>

                <CardFooter>
                  <span className="text-[11px] text-text-muted">
                    {periodLabel}
                  </span>

                  <Button variant="outline" size="sm">
                    <Download />
                    Generate
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

function StatementSide({
  title,
  lines,
  total,
  tone,
}: {
  title: string;
  lines: IncomeStatement['income'];
  total: number;
  tone: 'in' | 'out';
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader title={title} description={`${lines.length} heads posted`} />

      <ul className="flex-1 divide-y divide-border">
        {lines.map((line) => (
          <li key={line.account.id} className="px-5 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] text-text-primary">
                  {line.account.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-text-muted">
                  <span className="ref">{line.account.code}</span>
                  {line.account.nameTa ? ` · ${line.account.nameTa}` : ''}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <Amount
                  value={line.amount}
                  tone={tone}
                  className="text-[13px] font-medium"
                />
                <p className="mt-0.5 text-[11px] text-text-muted tabular">
                  {Math.round(line.share * 100)}%
                </p>
              </div>
            </div>

            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className={cn(
                  'h-full rounded-full',
                  tone === 'in' ? 'bg-chart-2' : 'bg-chart-5',
                )}
                style={{ width: `${Math.max(line.share * 100, 2)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <CardFooter>
        <span className="text-xs font-medium text-text-secondary">
          Total {title.toLowerCase()}
        </span>
        <Amount
          value={total}
          tone={tone}
          className="text-[13px] font-semibold"
        />
      </CardFooter>
    </Card>
  );
}

function TrialBalanceTable({
  rows,
  balanced,
}: {
  rows: readonly TrialBalanceRow[];
  balanced: boolean;
}) {
  const columns: DataColumn[] = [
    { key: 'code', label: 'Code' },
    { key: 'account', label: 'Account' },
    { key: 'class', label: 'Class' },
    { key: 'debit', label: 'Debit', align: 'right' },
    { key: 'credit', label: 'Credit', align: 'right' },
  ];

  const totals = rows.reduce(
    (sum, row) => ({
      debit: sum.debit + row.debit,
      credit: sum.credit + row.credit,
    }),
    { debit: 0, credit: 0 },
  );

  return (
    <Card>
      <CardHeader
        title="Trial Balance"
        description="Debit and credit totals per posting account"
        action={
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-medium',
              balanced
                ? 'bg-success-subtle text-success'
                : 'bg-danger-subtle text-danger',
            )}
          >
            {balanced ? 'Balanced' : 'Does not balance'}
          </span>
        }
      />

      <DataTable columns={columns} minWidth={760}>
        {rows.map((row) => (
          <DataRow key={row.account.id}>
            <DataCell nowrap className="ref text-xs text-text-muted">
              {row.account.code}
            </DataCell>

            <DataCell>
              <p className="truncate text-[13px] text-text-primary">
                {row.account.name}
              </p>
            </DataCell>

            <DataCell nowrap>
              <AccountTypeBadge type={row.account.type} />
            </DataCell>

            <DataCell align="right" nowrap>
              <Amount value={row.debit} tone="out" dashIfEmpty />
            </DataCell>

            <DataCell align="right" nowrap>
              <Amount value={row.credit} tone="in" dashIfEmpty />
            </DataCell>
          </DataRow>
        ))}

        <tr className="border-t border-border-strong bg-surface-2">
          <td
            colSpan={3}
            className="px-4 py-2.5 text-[11px] font-medium text-text-muted"
          >
            Totals across {rows.length} accounts
          </td>
          <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-danger tabular">
            {formatCurrency(totals.debit)}
          </td>
          <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-success tabular">
            {formatCurrency(totals.credit)}
          </td>
        </tr>
      </DataTable>
    </Card>
  );
}

function FundSummaryTable({ funds }: { funds: readonly FundPosition[] }) {
  const columns: DataColumn[] = [
    { key: 'fund', label: 'Fund' },
    { key: 'opening', label: 'Opening', align: 'right' },
    { key: 'income', label: 'Income', align: 'right' },
    { key: 'expenses', label: 'Expenditure', align: 'right' },
    { key: 'closing', label: 'Closing', align: 'right' },
  ];

  const totals = funds.reduce(
    (sum, fund) => ({
      opening: sum.opening + fund.opening,
      income: sum.income + fund.income,
      expenses: sum.expenses + fund.expenses,
      balance: sum.balance + fund.balance,
    }),
    { opening: 0, income: 0, expenses: 0, balance: 0 },
  );

  return (
    <Card>
      <CardHeader
        title="Fund-wise Summary"
        description="How each earmarked fund moved this year"
      />

      <DataTable columns={columns} minWidth={760}>
        {funds.map((fund) => (
          <DataRow key={fund.id}>
            <DataCell>
              <p className="truncate text-[13px] text-text-primary">
                {fund.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-text-muted">
                {fund.nameTa}
              </p>
            </DataCell>

            <DataCell align="right" nowrap>
              <Amount value={fund.opening} tone="muted" />
            </DataCell>

            <DataCell align="right" nowrap>
              <Amount value={fund.income} tone="in" />
            </DataCell>

            <DataCell align="right" nowrap>
              <Amount value={fund.expenses} tone="out" />
            </DataCell>

            <DataCell
              align="right"
              nowrap
              className="text-[13px] font-semibold text-text-primary tabular"
            >
              {formatCurrency(fund.balance)}
            </DataCell>
          </DataRow>
        ))}

        <tr className="border-t border-border-strong bg-surface-2">
          <td className="px-4 py-2.5 text-[11px] font-medium text-text-muted">
            All funds
          </td>
          <td className="px-4 py-2.5 text-right text-[13px] font-medium text-text-secondary tabular">
            {formatCurrency(totals.opening)}
          </td>
          <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-success tabular">
            {formatCurrency(totals.income)}
          </td>
          <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-danger tabular">
            {formatCurrency(totals.expenses)}
          </td>
          <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-text-primary tabular">
            {formatCurrency(totals.balance)}
          </td>
        </tr>
      </DataTable>
    </Card>
  );
}
