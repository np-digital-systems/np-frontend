'use client';

import { useServerAction } from '@/hooks/use-server-action';

import {
  closeDeposit,
  createDeposit,
  renewDeposit,
  updateDeposit,
} from '../../lib/finance-actions';

import { useMemo, useState } from 'react';
import { CalendarClock, PiggyBank, Plus } from 'lucide-react';

import {
  ActionError,
  Card,
  ConfirmDialog,
  DataCell,
  DataRow,
  DataTable,
  DataTableEmpty,
  EmptyState,
  PortalPageHeader,
  ReadOnlyNotice,
  StatCard,
  type DataColumn,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { DepositStatusBadge } from '../../components/finance-badges';
import {
  DepositFormDialog,
  type DepositDraft,
} from '../../components/deposit-form-dialog';
import {
  DEPOSIT_READ_ONLY_MESSAGE,
  type FinanceAccess,
} from '../../lib/finance-access';
import {
  DEPOSIT_STATUSES,
  DEPOSIT_STATUS_LABELS,
  INTEREST_PAYOUT_LABELS,
  MATURITY_ALERT_DAYS,
  formatCurrency,
  formatLongDate,
  formatShortDate,
} from '../../lib/finance-data';
import type { DepositRecord, DepositStatus, FundRecord } from '../../types';

interface DepositsScreenProps {
  initialDeposits: readonly DepositRecord[];
  funds: readonly FundRecord[];
  access: FinanceAccess;
  today: string;
  year: number;
}

export function DepositsScreen({
  initialDeposits,
  funds,
  access,
  year,
}: DepositsScreenProps) {
  const deposits = initialDeposits;
  const [status, setStatus] = useState<DepositStatus | 'all'>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DepositRecord | null>(null);
  const [closing, setClosing] = useState<DepositRecord | null>(null);

  const filtered = useMemo(
    () =>
      status === 'all'
        ? deposits
        : deposits.filter((deposit) => deposit.status === status),
    [deposits, status],
  );

  const totals = useMemo(() => {
    const active = deposits.filter((deposit) => deposit.status === 'active');

    return {
      principal: active.reduce((sum, deposit) => sum + deposit.principal, 0),
      maturityValue: active.reduce(
        (sum, deposit) => sum + deposit.maturityValue,
        0,
      ),
      accrued: active.reduce(
        (sum, deposit) => sum + deposit.interestAccrued,
        0,
      ),
      active: active.length,
      maturing: active.filter((deposit) => deposit.isMaturingSoon),
      overdue: active.filter((deposit) => deposit.isOverdue),
    };
  }, [deposits]);

  const attention = [...totals.overdue, ...totals.maturing];

  const { run, error: actionError } = useServerAction();
  const [renewing, setRenewing] = useState<DepositRecord | null>(null);

  function maturityOf(placedOn: string, tenureMonths: number): string {
    const matures = new Date(placedOn);

    matures.setMonth(matures.getMonth() + tenureMonths);

    return matures.toISOString().slice(0, 10);
  }

  function handleSubmit(draft: DepositDraft) {
    const target = editing;
    const input = {
      certificateNo: draft.certificateNo,
      bankName: draft.bankName,
      branch: draft.branch,
      principal: draft.principal,
      interestRate: draft.interestRate,
      placedOn: draft.placedOn,
      maturesOn: maturityOf(draft.placedOn, draft.tenureMonths),
      tenureMonths: draft.tenureMonths,
      interestPayout: draft.interestPayout,
      fundId: draft.fundId,
      notes: draft.notes,
    };

    run(
      () => {
        if (renewing) {
          // The renewal inherits the fund of the certificate it replaces.
          const { fundId, ...renewal } = input;
          void fundId;

          return renewDeposit(renewing.id, renewal);
        }

        return target ? updateDeposit(target.id, input) : createDeposit(input);
      },
      () => {
        setEditing(null);
        setRenewing(null);
        setFormOpen(false);
      },
    );
  }

  /**
   * Renewing opens the form pre-filled; the API marks the old certificate
   * renewed and links the new one to it when that form is submitted.
   */
  function handleRenew(deposit: DepositRecord) {
    setRenewing(deposit);
    setEditing(deposit);
    setFormOpen(true);
  }

  const columns: DataColumn[] = [
    { key: 'certificate', label: 'Certificate' },
    { key: 'fund', label: 'Fund' },
    { key: 'principal', label: 'Principal', align: 'right' },
    { key: 'rate', label: 'Rate', align: 'right' },
    { key: 'term', label: 'Term' },
    { key: 'maturity', label: 'Matures', align: 'right' },
    { key: 'value', label: 'Maturity Value', align: 'right' },
    { key: 'status', label: 'Status' },
    ...(access.canManageDeposits
      ? [{ key: 'actions', label: 'Actions', align: 'right', srOnly: true } as const]
      : []),
  ];

  return (
    <>
      <PortalPageHeader
        title="Fixed Deposits"
        description="Temple money placed with banks for a fixed term, with what each returns and when."
        meta={[
          <span key="year" className="tabular">
            Financial year {year}
          </span>,
          <span key="active" className="tabular">
            {totals.active} active
          </span>,
          attention.length > 0 ? (
            <span key="maturing" className="text-warning tabular">
              {attention.length} needing attention
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          <>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as DepositStatus | 'all')
              }
            >
              <SelectTrigger aria-label="Filter by status">
                <SelectValue />

      <ActionError message={actionError} />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All deposits</SelectItem>

                {DEPOSIT_STATUSES.map((entry) => (
                  <SelectItem key={entry} value={entry}>
                    {DEPOSIT_STATUS_LABELS[entry]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {access.canManageDeposits && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus />
                Place Deposit
              </Button>
            )}
          </>
        }
      />

      {!access.canManageDeposits && (
        <ReadOnlyNotice message={DEPOSIT_READ_ONLY_MESSAGE} />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Principal Placed"
          value={formatCurrency(totals.principal)}
          caption={`${totals.active} active deposits`}
        />
        <StatCard
          label="Interest Accrued"
          value={formatCurrency(totals.accrued)}
          caption="Earned to date"
        />
        <StatCard
          label="Value at Maturity"
          value={formatCurrency(totals.maturityValue)}
          caption="Principal plus full-term interest"
        />
        <StatCard
          label="Maturing Soon"
          value={String(attention.length)}
          caption={`Within ${MATURITY_ALERT_DAYS} days`}
        />
      </div>

      {attention.length > 0 && (
        <Card>
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-3">
            <CalendarClock className="size-4 text-warning" aria-hidden />
            <h2 className="text-[13px] font-semibold text-text-primary">
              Maturities needing attention
            </h2>
          </div>

          <ul className="divide-y divide-border">
            {attention.map((deposit) => (
              <li
                key={deposit.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="ref text-xs font-medium text-primary">
                    {deposit.certificateNo}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-text-primary">
                    {deposit.bankName} · {formatCurrency(deposit.principal)} at{' '}
                    {deposit.interestRate}%
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <div className="text-right">
                    <p
                      className={cn(
                        'text-[13px] font-semibold tabular',
                        deposit.isOverdue ? 'text-danger' : 'text-warning',
                      )}
                    >
                      {deposit.isOverdue
                        ? `${Math.abs(deposit.daysToMaturity)} days overdue`
                        : `${deposit.daysToMaturity} days left`}
                    </p>
                    <p className="mt-0.5 text-[11px] text-text-muted tabular">
                      {formatLongDate(deposit.maturesOn)}
                    </p>
                  </div>

                  {access.canManageDeposits && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRenew(deposit)}
                    >
                      Renew
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <DataTable columns={columns} minWidth={1120}>
          {filtered.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              <EmptyState
                icon={PiggyBank}
                title={
                  deposits.length === 0
                    ? 'No fixed deposits recorded'
                    : 'No deposits with this status'
                }
                description={
                  deposits.length === 0
                    ? 'Record the temple’s deposits so their maturities and interest are tracked.'
                    : 'Choose a different status to see more.'
                }
              />
            </DataTableEmpty>
          ) : (
            filtered.map((deposit) => (
              <DataRow key={deposit.id}>
                <DataCell>
                  <p className="ref truncate text-xs font-medium text-primary">
                    {deposit.certificateNo}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-text-primary">
                    {deposit.bankName}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-text-muted">
                    {deposit.branch} ·{' '}
                    {INTEREST_PAYOUT_LABELS[deposit.interestPayout]} interest
                  </p>
                </DataCell>

                <DataCell nowrap className="text-xs text-text-secondary">
                  {deposit.fundName}
                </DataCell>

                <DataCell
                  align="right"
                  nowrap
                  className="text-[13px] font-medium text-text-primary tabular"
                >
                  {formatCurrency(deposit.principal)}
                </DataCell>

                <DataCell align="right" nowrap className="text-xs tabular">
                  {deposit.interestRate.toFixed(2)}%
                </DataCell>

                <DataCell nowrap className="text-xs text-text-secondary tabular">
                  {deposit.tenureMonths} months
                  <span className="block text-[11px] text-text-muted">
                    from {formatShortDate(deposit.placedOn)}
                  </span>
                </DataCell>

                <DataCell align="right" nowrap>
                  <span className="text-[13px] text-text-primary tabular">
                    {formatShortDate(deposit.maturesOn)}
                  </span>

                  {deposit.status === 'active' && (
                    <span
                      className={cn(
                        'mt-0.5 block text-[11px] tabular',
                        deposit.isOverdue
                          ? 'text-danger'
                          : deposit.isMaturingSoon
                            ? 'text-warning'
                            : 'text-text-muted',
                      )}
                    >
                      {deposit.isOverdue
                        ? `${Math.abs(deposit.daysToMaturity)}d overdue`
                        : `${deposit.daysToMaturity}d left`}
                    </span>
                  )}
                </DataCell>

                <DataCell align="right" nowrap>
                  <span className="text-[13px] font-medium text-text-primary tabular">
                    {formatCurrency(deposit.maturityValue)}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-success tabular">
                    +{formatCurrency(deposit.interestOnMaturity)}
                  </span>
                </DataCell>

                <DataCell nowrap>
                  <DepositStatusBadge status={deposit.status} />
                </DataCell>

                {access.canManageDeposits && (
                  <DataCell align="right" nowrap>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${deposit.certificateNo}`}
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditing(deposit);
                            setFormOpen(true);
                          }}
                        >
                          Edit details
                        </DropdownMenuItem>

                        {deposit.status === 'active' && (
                          <>
                            <DropdownMenuItem
                              onSelect={() => handleRenew(deposit)}
                            >
                              Renew on maturity
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setClosing(deposit)}
                            >
                              Close deposit
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </DataCell>
                )}
              </DataRow>
            ))
          )}
        </DataTable>
      </Card>

      {access.canManageDeposits && (
        <DepositFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          deposit={editing}
          funds={funds}
          existing={deposits}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={closing !== null}
        onOpenChange={(open) => !open && setClosing(null)}
        title="Close this deposit?"
        confirmLabel="Close Deposit"
        description={
          closing
            ? `${closing.certificateNo} — ${formatCurrency(closing.principal)} placed with ${closing.bankName}. Closing before ${formatLongDate(closing.maturesOn)} usually forfeits part of the interest. The record is kept for the audit trail.`
            : ''
        }
        onConfirm={() => {
          if (closing) run(() => closeDeposit(closing.id));
          setClosing(null);
        }}
      />
    </>
  );
}
