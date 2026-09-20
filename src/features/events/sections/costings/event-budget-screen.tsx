'use client';

import { useState } from 'react';
import { ArrowLeft, ReceiptText, Scale } from 'lucide-react';

import {
  ActionError,
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
import { useServerAction } from '@/hooks/use-server-action';
import { Link } from '@/i18n/routing';
import { formatCurrency, formatSigned } from '@/lib/format';

import { RaiseVoucherDialog } from '../../components/raise-voucher-dialog';
import { raiseEventPayment, raiseEventReceipt } from '../../lib/costing-actions';
import { BUDGET_LINE_BADGE } from '../../lib/costing-data';
import { formatEventDate } from '../../lib/event-data';
import { EVENT_ROUTES } from '../../lib/routes';
import type { EventRecord } from '../../types';
import type { BudgetLine, EventBudget } from '../../types/costing';

const COLUMNS: DataColumn[] = [
  { key: 'head', label: 'Head' },
  { key: 'payee', label: 'Usually paid to' },
  { key: 'budgeted', label: 'Budgeted', align: 'right' },
  { key: 'actual', label: 'Actual', align: 'right' },
  { key: 'variance', label: 'Difference', align: 'right' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', align: 'right', srOnly: true },
];

interface EventBudgetScreenProps {
  event: EventRecord;
  budget: EventBudget;
  bankAccounts: readonly { id: number; label: string }[];
  canRaiseVouchers: boolean;
}

export function EventBudgetScreen({
  event,
  budget,
  bankAccounts,
  canRaiseVouchers,
}: EventBudgetScreenProps) {
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [payingLine, setPayingLine] = useState<BudgetLine | null>(null);

  const { run, error: actionError } = useServerAction();

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

        <div className="flex flex-wrap items-start justify-between gap-4">
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

          <div className="flex items-center gap-2">
            {canRaiseVouchers && costed && (
              <Button onClick={() => setReceiptOpen(true)}>
                <ReceiptText />
                Raise receipt
              </Button>
            )}
          </div>
        </div>
      </div>

      <ActionError message={actionError} />

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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Sponsor was quoted"
              value={formatCurrency(quoted)}
              caption={
                received >= quoted && quoted > 0
                  ? 'Receipted in full'
                  : `${formatCurrency(received)} receipted`
              }
            />

            <StatCard label="Budgeted" value={formatCurrency(budget.budgetedTotal)} />

            <StatCard label="Actual" value={formatCurrency(budget.actualTotal)} />

            {/*
              * Positive is an overspend, which is why it is the unwelcome
              * colour: the committee's question is always which head went over.
              */}
            <StatCard
              label="Difference"
              value={formatSigned(budget.variance)}
              caption={
                budget.variance > 0 ? 'Over the budget' : 'Within the budget'
              }
            />
          </div>

          <Card>
            <CardHeader
              title="Budget against actual"
              description="The costing is the plan; the vouchers are the truth. A line is settled once its voucher is posted."
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

                    <DataCell align="right" nowrap>
                      {canRaiseVouchers && line.status === 'Not raised' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPayingLine(line)}
                        >
                          Pay
                        </Button>
                      )}
                    </DataCell>
                  </DataRow>
                ))
              )}
            </DataTable>
          </Card>
        </>
      )}

      <RaiseVoucherDialog
        kind="receipt"
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        title="Raise the sponsor’s receipt"
        description={
          event.sponsor
            ? `${event.sponsor.name} was quoted ${formatCurrency(quoted)}. Everything but the date, how the money came and the book number is filled in already.`
            : 'This occurrence has no sponsor named, so a receipt cannot be raised for it.'
        }
        defaultAmount={quoted}
        bankAccounts={bankAccounts}
        onSubmit={(movement) => {
          run(
            () => raiseEventReceipt(event.id, movement),
            () => setReceiptOpen(false),
          );
        }}
      />

      {/*
        * One payee per voucher. The lines are settled one at a time here for
        * that reason — the goods shop and the melam group are two documents,
        * two signatures and two receipts, never one.
        */}
      <RaiseVoucherDialog
        kind="payment"
        open={payingLine !== null}
        onOpenChange={(next) => !next && setPayingLine(null)}
        title="Raise a payment"
        description={
          payingLine
            ? `${payingLine.label}, budgeted at ${formatCurrency(payingLine.budgeted)}${payingLine.partyName ? ` and usually paid to ${payingLine.partyName}` : ''}. Change the amount to what was really paid.`
            : ''
        }
        defaultAmount={payingLine?.budgeted ?? 0}
        needsPayee={payingLine?.partyName === null}
        bankAccounts={bankAccounts}
        onSubmit={(movement, extras) => {
          const target = payingLine;

          if (!target) return;

          run(
            () =>
              raiseEventPayment(event.id, {
                ...movement,
                lines: [
                  { budgetLineId: Number(target.id), amount: movement.amount },
                ],
                party: extras?.party,
              }),
            () => setPayingLine(null),
          );
        }}
      />
    </>
  );
}
