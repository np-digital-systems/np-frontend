'use client';

import { useServerAction } from '@/hooks/use-server-action';

import {
  closeDeposit,
  createDeposit,
  loadDepositInterest,
  recordDepositInterest,
  renewDeposit,
  updateDeposit,
} from '../../lib/finance-actions';

import { useMemo, useState } from 'react';
import { CalendarClock, PiggyBank, Plus } from 'lucide-react';

import type { BankAccountRef } from '@/features/accounting/types';
import {
  ActionError,
  Card,
  CardHeader,
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
import { DepositInterestDialog } from '../../components/deposit-interest-dialog';
import {
  RecordInterestDialog,
  type InterestDraft,
} from '../../components/record-interest-dialog';
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
import type {
  DepositInterest,
  DepositRecord,
  DepositStatus,
  FundRecord,
  PoojaFunding,
  SlotOption,
} from '../../types';

const FUNDING_COLUMNS: DataColumn[] = [
  { key: 'pooja', label: 'Purpose' },
  { key: 'deposits', label: 'Deposits', align: 'right' },
  { key: 'interest', label: 'Interest Received', align: 'right' },
  { key: 'topups', label: 'Sponsor Top-ups', align: 'right' },
  { key: 'spent', label: 'Spent', align: 'right' },
  { key: 'balance', label: 'Balance', align: 'right' },
];

interface DepositsScreenProps {
  initialDeposits: readonly DepositRecord[];
  funds: readonly FundRecord[];
  slots: readonly SlotOption[];
  bankAccounts: readonly BankAccountRef[];
  funding: PoojaFunding | null;
  access: FinanceAccess;
  today: string;
  year: number;
}

export function DepositsScreen({
  initialDeposits,
  funds,
  slots,
  bankAccounts,
  funding,
  access,
  today,
  year,
}: DepositsScreenProps) {
  const deposits = initialDeposits;
  const [status, setStatus] = useState<DepositStatus | 'all'>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DepositRecord | null>(null);
  const [closing, setClosing] = useState<DepositRecord | null>(null);
  const [receiving, setReceiving] = useState<DepositRecord | null>(null);
  const [viewing, setViewing] = useState<DepositRecord | null>(null);
  const [interest, setInterest] = useState<DepositInterest | null | undefined>();

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
      slotId: draft.slotId,
      notes: draft.notes,
    };

    run(
      () => {
        if (renewing) {
          const { fundId, slotId, ...renewal } = input;
          void fundId;
          void slotId;

          return renewDeposit(renewing.id, {
            ...renewal,
            manualVoucherNo: draft.manualVoucherNo,
          });
        }

        if (target) return updateDeposit(target.id, input);

        return createDeposit({
          ...input,
          source: draft.source,
          mode: draft.mode,
          fromBankAccountId: draft.fromBankAccountId,
          chequeNo: draft.chequeNo,
          manualVoucherNo: draft.manualVoucherNo,
        });
      },
      () => {
        setEditing(null);
        setRenewing(null);
        setFormOpen(false);
      },
    );
  }

  function handleInterest(draft: InterestDraft) {
    const target = receiving;

    if (target) run(() => recordDepositInterest(target.id, draft));
  }

  function handleClose(draft: InterestDraft) {
    const target = closing;

    if (target) run(() => closeDeposit(target.id, draft));
  }

  async function showInterest(deposit: DepositRecord) {
    setViewing(deposit);
    setInterest(undefined);
    setInterest(await loadDepositInterest(deposit.id));
  }

  // On submit, the API marks the old certificate renewed and links the new one.
  function handleRenew(deposit: DepositRecord) {
    setRenewing(deposit);
    setEditing(deposit);
    setFormOpen(true);
  }

  const columns: DataColumn[] = [
    { key: 'certificate', label: 'Certificate' },
    { key: 'pooja', label: 'Purpose' },
    { key: 'principal', label: 'Principal', align: 'right' },
    { key: 'rate', label: 'Rate', align: 'right' },
    { key: 'term', label: 'Term' },
    { key: 'maturity', label: 'Matures', align: 'right' },
    { key: 'value', label: 'Maturity Value', align: 'right' },
    { key: 'interest', label: 'Interest Received', align: 'right' },
    { key: 'status', label: 'Status' },
    ...(access.canManageDeposits
      ? [{ key: 'actions', label: 'Actions', align: 'right', srOnly: true } as const]
      : []),
  ];

  return (
    <>
      <PortalPageHeader
        title="Fixed Deposits"
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

      <ActionError message={actionError} />

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
        />
        <StatCard
          label="Value at Maturity"
          value={formatCurrency(totals.maturityValue)}
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
        <DataTable columns={columns} minWidth={1240}>
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
                    ? undefined
                    : 'Try a different status.'
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
                  <span className="text-[13px] text-text-primary">
                    {deposit.poojaName ?? 'General'}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-text-muted">
                    {deposit.fundName}
                  </span>
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

                <DataCell align="right" nowrap>
                  <button
                    type="button"
                    className="text-[13px] font-medium text-primary tabular hover:underline"
                    aria-label={`Interest by year for ${deposit.certificateNo}`}
                    onClick={() => void showInterest(deposit)}
                  >
                    {formatCurrency(deposit.interestReceived)}
                  </button>
                </DataCell>

                <DataCell nowrap>
                  <DepositStatusBadge status={deposit.status} />

                  {deposit.placementVoucher && (
                    <span className="mt-0.5 block text-[11px] text-text-muted ref">
                      {deposit.placementVoucher.ref}
                    </span>
                  )}

                  {deposit.bookDifference !== 0 && (
                    <span className="mt-0.5 block text-[11px] text-warning tabular">
                      Books differ by {formatCurrency(Math.abs(deposit.bookDifference))}
                    </span>
                  )}
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
                        <DropdownMenuItem onSelect={() => setReceiving(deposit)}>
                          Record interest
                        </DropdownMenuItem>

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

      {funding && funding.rows.length > 0 && (
        <Card>
          <CardHeader
            title="Pooja Funding"
            description={`Financial year ${funding.financialYearLabel}`}
          />

          <DataTable columns={FUNDING_COLUMNS} minWidth={900}>
            {funding.rows.map((row) => (
              <DataRow key={row.slotId ?? 'kovil'}>
                <DataCell>
                  <p className="truncate text-[13px] text-text-primary">
                    {row.poojaName ?? 'General'}
                  </p>
                  {row.sponsorName && (
                    <p className="mt-0.5 truncate text-[11px] text-text-muted">
                      {row.sponsorName}
                    </p>
                  )}
                </DataCell>

                <DataCell align="right" nowrap className="text-xs tabular">
                  {row.deposits}
                  <span className="block text-[11px] text-text-muted">
                    {formatCurrency(row.principal)}
                  </span>
                </DataCell>

                <DataCell align="right" nowrap className="text-[13px] tabular">
                  {formatCurrency(row.interestReceived)}
                </DataCell>

                <DataCell align="right" nowrap className="text-[13px] tabular">
                  {formatCurrency(row.sponsorTopUps)}
                </DataCell>

                <DataCell align="right" nowrap className="text-[13px] tabular">
                  {formatCurrency(row.spent)}
                </DataCell>

                <DataCell align="right" nowrap>
                  <span
                    className={cn(
                      'text-[13px] font-medium tabular',
                      row.balance < 0 ? 'text-danger' : 'text-text-primary',
                    )}
                  >
                    {formatCurrency(Math.abs(row.balance))}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-text-muted">
                    {row.balance < 0 ? 'Shortfall' : 'Surplus'}
                  </span>
                </DataCell>
              </DataRow>
            ))}
          </DataTable>
        </Card>
      )}

      {access.canManageDeposits && (
        <DepositFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          purpose={renewing ? 'renew' : editing ? 'edit' : 'place'}
          deposit={editing}
          funds={funds}
          bankAccounts={bankAccounts}
          slots={slots}
          existing={deposits}
          onSubmit={handleSubmit}
        />
      )}

      {access.canManageDeposits && (
        <RecordInterestDialog
          open={receiving !== null}
          onOpenChange={(open) => !open && setReceiving(null)}
          deposit={receiving}
          bankAccounts={bankAccounts}
          today={today}
          onSubmit={handleInterest}
        />
      )}

      <DepositInterestDialog
        deposit={viewing}
        interest={interest}
        onOpenChange={(open) => !open && setViewing(null)}
      />

      {access.canManageDeposits && (
        <RecordInterestDialog
          open={closing !== null}
          onOpenChange={(open) => !open && setClosing(null)}
          purpose="close"
          deposit={closing}
          bankAccounts={bankAccounts}
          today={today}
          onSubmit={handleClose}
        />
      )}
    </>
  );
}
