'use client';

import { ArrowLeft, Scale } from 'lucide-react';

import {
  Card,
  CardHeader,
  DataCell,
  DataRow,
  DataTable,
  DataTableEmpty,
  EmptyState,
  StatCard,
  StatusBadge,
  type DataColumn,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { formatCurrency, formatSigned } from '@/lib/format';

import { BUDGET_LINE_BADGE } from '../../lib/costing-data';
import { formatEventDate } from '../../lib/event-data';
import { EVENT_ROUTES } from '../../lib/routes';
import type { EventRecord } from '../../types';
import type { EventBudget } from '../../types/costing';

const COLUMNS: DataColumn[] = [
  { key: 'head', label: 'Head' },
  { key: 'payee', label: 'Usually paid to' },
  { key: 'budgeted', label: 'Budgeted', align: 'right' },
  { key: 'actual', label: 'Actual', align: 'right' },
  { key: 'variance', label: 'Difference', align: 'right' },
  { key: 'status', label: 'Status' },
];

interface EventBudgetScreenProps {
  event: EventRecord;
  budget: EventBudget;
}

export function EventBudgetScreen({
  event,
  budget,
}: EventBudgetScreenProps) {

  // Nothing is costed onto a day any more: the version in force on the day's
  // own date is what priced it, resolved fresh each time this is opened.
  const costed = budget.lines.length > 0;
  const quoted = budget.sponsorAmount ?? 0;
  const received = budget.sponsorReceived ?? 0;

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="self-start" asChild>
          <Link href={EVENT_ROUTES.calendar}>
            <ArrowLeft />
            Event calendar
          </Link>
        </Button>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-[-0.01em] text-text-primary">
              {event.eventType.name}
            </h1>

            <StatusBadge status={event.status} />
          </div>

          <p className="text-sm text-text-secondary">
            {event.instanceLabel} · {formatEventDate(event.scheduledDate)}
            {event.sponsor ? ` · ${event.sponsor.name}` : ' · no sponsor named'}
          </p>
        </div>
      </div>

      {!costed ? (
        <Card>
          <EmptyState
            icon={Scale}
            title="No costing covers this day"
            description={
              budget.problem ??
              'Write a costing for this pooja and it applies to this day at once.'
            }
          />
        </Card>
      ) : (
        <>
          {/*
            * Three figures, not four.
            *
            * What the sponsor is quoted and what the day is budgeted at are the
            * same number unless the temple bears a line itself, which it rarely
            * does — so the budget is carried as the caption on what was really
            * spent, where it is read against it rather than beside it.
            */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Sponsor was quoted"
              value={formatCurrency(quoted)}
              caption={
                received >= quoted && quoted > 0
                  ? 'Receipted in full'
                  : `${formatCurrency(received)} receipted`
              }
            />

            <StatCard
              label="Actual"
              value={formatCurrency(budget.actualTotal)}
              caption={`${formatCurrency(budget.budgetedTotal)} budgeted`}
            />

            {/*
              * Positive is an overspend, which is why it is the unwelcome
              * colour: the committee's question is always which head went over.
              */}
            <StatCard
              label="Difference"
              value={formatSigned(budget.variance)}
              caption={
                /*
                 * Nothing spent is not the same as spending less than planned,
                 * and calling it "within the budget" reads as a result when it
                 * only means no voucher has been coded to the day yet.
                 */
                budget.actualTotal === 0
                  ? 'Nothing spent yet'
                  : budget.variance > 0
                    ? 'Over the budget'
                    : 'Within the budget'
              }
            />
          </div>

          <Card>
            <CardHeader
              title="Budget against actual"
              description="What each head was planned to cost, against what has been spent. A line settles when its voucher is posted."
            />

            <DataTable columns={COLUMNS} minWidth={920}>
              {budget.lines.length === 0 ? (
                <DataTableEmpty colSpan={COLUMNS.length}>
                  <EmptyState
                    icon={Scale}
                    title="No budget lines"
                    description="The costing this was taken from had no lines."
                  />
                </DataTableEmpty>
              ) : (
                budget.lines.map((line) => (
                  <DataRow key={line.id}>
                    <DataCell>
                      <p className="font-medium text-text-primary">{line.label}</p>

                      <p className="text-xs text-text-muted tabular">
                        {line.account.code} · {line.account.name}
                        {!line.chargedToSponsor && ' · borne by the temple'}
                      </p>
                    </DataCell>

                    <DataCell nowrap className="text-text-secondary">
                      {line.partyName ?? (
                        <span className="text-text-disabled">—</span>
                      )}
                    </DataCell>

                    <DataCell align="right" nowrap className="tabular">
                      {formatCurrency(line.budgeted)}
                    </DataCell>

                    <DataCell align="right" nowrap className="tabular">
                      {line.actual > 0 ? (
                        formatCurrency(line.actual)
                      ) : (
                        <span className="text-text-disabled">—</span>
                      )}
                    </DataCell>

                    <DataCell
                      align="right"
                      nowrap
                      className={`tabular ${line.variance > 0 ? 'text-danger' : 'text-text-secondary'}`}
                    >
                      {line.actual > 0 ? (
                        formatSigned(line.variance)
                      ) : (
                        <span className="text-text-disabled">—</span>
                      )}
                    </DataCell>

                    <DataCell nowrap>
                      <StatusBadge status={BUDGET_LINE_BADGE[line.status]} />
                    </DataCell>

                  </DataRow>
                ))
              )}
            </DataTable>
          </Card>
        </>
      )}

    </>
  );
}
