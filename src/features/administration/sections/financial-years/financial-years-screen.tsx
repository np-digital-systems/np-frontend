'use client';

import { useServerAction } from '@/hooks/use-server-action';

import {
  closeFinancialYear,
  createFinancialYear,
  openFinancialYear,
} from '../../lib/administration-actions';
import { FinancialYearFormDialog } from '../../components/financial-year-form-dialog';

import { useMemo, useState } from 'react';
import { CalendarRange, Lock, Plus } from 'lucide-react';

import {
  ActionError,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  ConfirmDialog,
  DataCell,
  DataRow,
  DataTable,
  PortalPageHeader,
  ReadOnlyNotice,
  StatCard,
  type DataColumn,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import {
  FINANCIAL_YEAR_READ_ONLY_MESSAGE,
  type AdministrationAccess,
} from '../../lib/administration-access';
import {
  YEAR_STATUS_LABELS,
  formatCurrency,
  formatLongDate,
} from '../../lib/administration-data';
import type { FinancialYearRecord, FinancialYearStatus } from '../../types';

interface FinancialYearsScreenProps {
  initialYears: readonly FinancialYearRecord[];
  access: AdministrationAccess;
  today: string;
}

const STATUS_TONE: Record<FinancialYearStatus, string> = {
  open: 'bg-success-subtle text-success',
  closed: 'bg-neutral-subtle text-text-muted',
  upcoming: 'bg-info-subtle text-info',
};

/**
 * TODO: replace the local mutations with calls to the financial-years API.
 */
export function FinancialYearsScreen({
  initialYears,
  access,
  today,
}: FinancialYearsScreenProps) {
  const { run, error: actionError } = useServerAction();
  const years = initialYears;
  const [closing, setClosing] = useState<FinancialYearRecord | null>(null);
  const [opening, setOpening] = useState<FinancialYearRecord | null>(null);
  const [creating, setCreating] = useState(false);

  const current = useMemo(
    () => years.find((year) => year.isCurrent) ?? null,
    [years],
  );

  const totals = useMemo(
    () => ({
      closed: years.filter((year) => year.status === 'closed').length,
      lifetimeIncome: years.reduce((sum, year) => sum + year.income, 0),
      lifetimeExpenses: years.reduce((sum, year) => sum + year.expenses, 0),
    }),
    [years],
  );

  const columns: DataColumn[] = [
    { key: 'year', label: 'Year' },
    { key: 'period', label: 'Period' },
    { key: 'opening', label: 'Opening', align: 'right' },
    { key: 'income', label: 'Income', align: 'right' },
    { key: 'expenses', label: 'Expenditure', align: 'right' },
    { key: 'surplus', label: 'Surplus', align: 'right' },
    { key: 'closing', label: 'Closing', align: 'right' },
    { key: 'status', label: 'Status' },
    ...(access.canManageFinancialYears
      ? [
          {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            srOnly: true,
          } as const,
        ]
      : []),
  ];

  return (
    <>
      <PortalPageHeader
        title="Financial Years"
        description="The period the books are kept in. Only the open year accepts new entries."
        meta={[
          current ? (
            <span key="current" className="tabular">
              Current year {current.label}
            </span>
          ) : null,
          <span key="closed" className="tabular">
            {totals.closed} closed
          </span>,
        ].filter(Boolean)}
        actions={
          access.canManageFinancialYears && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setCreating(true)}>
                <Plus />
                New Year
              </Button>

              <Button
                onClick={() =>
                  setOpening(
                    years.find((year) => year.status === 'upcoming') ?? null,
                  )
                }
                disabled={!years.some((year) => year.status === 'upcoming')}
              >
                Open Next Year
              </Button>
            </div>
          )
        }
      />

      <ActionError message={actionError} />

      {access.canManageFinancialYears && (
        <FinancialYearFormDialog
          open={creating}
          onOpenChange={setCreating}
          onSubmit={(input) => run(() => createFinancialYear(input))}
        />
      )}

      {!access.canManageFinancialYears && (
        <ReadOnlyNotice message={FINANCIAL_YEAR_READ_ONLY_MESSAGE} />
      )}

      {current && <CurrentYearCard year={current} today={today} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Current Year"
          value={current?.label ?? '—'}
          caption={current ? YEAR_STATUS_LABELS[current.status] : 'None open'}
        />
        <StatCard
          label="Years on Record"
          value={String(years.length)}
          caption={`${totals.closed} closed`}
        />
        <StatCard
          label="Lifetime Income"
          value={formatCurrency(totals.lifetimeIncome)}
          caption="Across every year"
        />
        <StatCard
          label="Lifetime Expenditure"
          value={formatCurrency(totals.lifetimeExpenses)}
          caption="Across every year"
        />
      </div>

      <Card>
        <CardHeader
          title="All financial years"
          description="Oldest at the bottom"
        />

        <DataTable columns={columns} minWidth={1180}>
          {years.map((year) => (
            <DataRow key={year.id}>
              <DataCell nowrap>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-text-primary tabular">
                    {year.label}
                  </span>
                  {year.isCurrent && (
                    <span className="rounded bg-primary-subtle px-1 py-0.5 text-[10px] font-medium text-primary">
                      Current
                    </span>
                  )}
                </div>
                {year.closedOn && (
                  <span className="mt-0.5 block text-[11px] text-text-muted">
                    Closed by {year.closedBy}
                  </span>
                )}
              </DataCell>

              <DataCell nowrap className="text-xs text-text-secondary tabular">
                {formatLongDate(year.startsOn)}
                <span className="block text-[11px] text-text-muted">
                  to {formatLongDate(year.endsOn)}
                </span>
              </DataCell>

              <DataCell
                align="right"
                nowrap
                className="text-[13px] text-text-secondary tabular"
              >
                {formatCurrency(year.openingBalance)}
              </DataCell>

              <DataCell
                align="right"
                nowrap
                className="text-[13px] text-success tabular"
              >
                {formatCurrency(year.income)}
              </DataCell>

              <DataCell
                align="right"
                nowrap
                className="text-[13px] text-danger tabular"
              >
                {formatCurrency(year.expenses)}
              </DataCell>

              <DataCell
                align="right"
                nowrap
                className={cn(
                  'text-[13px] font-medium tabular',
                  year.surplus >= 0 ? 'text-success' : 'text-danger',
                )}
              >
                {formatCurrency(year.surplus)}
              </DataCell>

              <DataCell
                align="right"
                nowrap
                className="text-[13px] font-semibold text-text-primary tabular"
              >
                {formatCurrency(year.closingBalance)}
              </DataCell>

              <DataCell nowrap>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                    STATUS_TONE[year.status],
                  )}
                >
                  {year.status === 'closed' && (
                    <Lock className="size-2.5" aria-hidden />
                  )}
                  {YEAR_STATUS_LABELS[year.status]}
                </span>
              </DataCell>

              {access.canManageFinancialYears && (
                <DataCell align="right" nowrap>
                  {year.status === 'open' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setClosing(year)}
                    >
                      Close year
                    </Button>
                  ) : year.status === 'upcoming' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOpening(year)}
                    >
                      Open year
                    </Button>
                  ) : (
                    <span className="text-[11px] text-text-muted">Locked</span>
                  )}
                </DataCell>
              )}
            </DataRow>
          ))}
        </DataTable>
      </Card>

      <ConfirmDialog
        open={closing !== null}
        onOpenChange={(open) => !open && setClosing(null)}
        title={`Close financial year ${closing?.label ?? ''}?`}
        confirmLabel="Close Year"
        description={
          closing
            ? `All ${closing.voucherCount} vouchers in ${closing.label} will be locked against further change, and its closing balance of ${formatCurrency(closing.closingBalance)} carries forward as the next year's opening. This cannot be undone.`
            : ''
        }
        onConfirm={() => {
          if (!closing) return;

          run(() => closeFinancialYear(closing.id));
          setClosing(null);
        }}
      />

      <ConfirmDialog
        open={opening !== null}
        onOpenChange={(open) => !open && setOpening(null)}
        title={`Open financial year ${opening?.label ?? ''}?`}
        confirmLabel="Open Year"
        description={
          opening
            ? `${opening.label} becomes the year new vouchers post into. Any year still open will need closing separately — the books can only carry one current year.`
            : ''
        }
        onConfirm={() => {
          if (!opening) return;

          run(() => openFinancialYear(opening.id));
          setOpening(null);
        }}
      />
    </>
  );
}

function CurrentYearCard({
  year,
  today,
}: {
  year: FinancialYearRecord;
  today: string;
}) {
  const elapsed = Math.min(
    Math.max(
      (Date.parse(today) - Date.parse(year.startsOn)) /
        (Date.parse(year.endsOn) - Date.parse(year.startsOn)),
      0,
    ),
    1,
  );

  return (
    <Card>
      <CardHeader
        title={`Financial year ${year.label}`}
        description={`${formatLongDate(year.startsOn)} to ${formatLongDate(year.endsOn)}`}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-md bg-success-subtle px-1.5 py-0.5 text-[11px] font-medium text-success">
            <span className="size-1.5 rounded-full bg-current" aria-hidden />
            Open
          </span>
        }
      />

      <CardBody className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <Figure label="Opening balance" value={year.openingBalance} />
          <Figure label="Income" value={year.income} tone="in" />
          <Figure label="Expenditure" value={year.expenses} tone="out" />
          <Figure
            label="Closing balance"
            value={year.closingBalance}
            emphasis
          />
        </dl>

        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(elapsed * 100, 2)}%` }}
            />
          </div>

          <p className="mt-1.5 text-[11px] text-text-muted tabular">
            {Math.round(elapsed * 100)}% of the year elapsed ·{' '}
            {year.voucherCount} vouchers posted
          </p>
        </div>
      </CardBody>

      <CardFooter>
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <CalendarRange className="size-3.5" aria-hidden />
          New entries post into {year.label}
        </span>
      </CardFooter>
    </Card>
  );
}

function Figure({
  label,
  value,
  tone = 'default',
  emphasis,
}: {
  label: string;
  value: number;
  tone?: 'default' | 'in' | 'out';
  emphasis?: boolean;
}) {
  const TONES = {
    default: 'text-text-secondary',
    in: 'text-success',
    out: 'text-danger',
  } as const;

  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-text-muted">{label}</dt>
      <dd
        className={cn(
          'mt-0.5 truncate tabular',
          emphasis
            ? 'text-[15px] font-semibold text-text-primary'
            : `text-[13px] font-semibold ${TONES[tone]}`,
        )}
      >
        {formatCurrency(value)}
      </dd>
    </div>
  );
}
