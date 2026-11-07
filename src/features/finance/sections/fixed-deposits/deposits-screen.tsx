'use client';

import { useServerAction } from '@/hooks/use-server-action';

import {
  closeDeposit,
  createDeposit,
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
  CardBody,
  CardFooter,
  CardHeader,
  EmptyState,
  LinkButton,
  PortalPageHeader,
  ReadOnlyNotice,
  StatCard,
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
import { FINANCE_ROUTES } from '../../lib/routes';
import {
  DepositFormDialog,
  type DepositDraft,
} from '../../components/deposit-form-dialog';
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
} from '../../lib/finance-data';
import type {
  DepositRecord,
  DepositStatus,
  FundRecord,
  SlotOption,
} from '../../types';

interface DepositsScreenProps {
  initialDeposits: readonly DepositRecord[];
  funds: readonly FundRecord[];
  slots: readonly SlotOption[];
  bankAccounts: readonly BankAccountRef[];
  access: FinanceAccess;
  today: string;
  year: number;
}

export function DepositsScreen({
  initialDeposits,
  funds,
  slots,
  bankAccounts,
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
      name: draft.name,
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
      purpose: draft.forPooja ? ('pooja' as const) : ('general' as const),
      slotId: draft.slotId,
      notes: draft.notes,
    };

    run(
      () => {
        if (renewing) {
          const { name, fundId, purpose, slotId, ...renewal } = input;
          void name;
          void purpose;
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

  // On submit, the API marks the old certificate renewed and links the new one.
  function handleRenew(deposit: DepositRecord) {
    setRenewing(deposit);
    setEditing(deposit);
    setFormOpen(true);
  }

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
                  <p className="text-xs font-medium text-primary">
                    {deposit.name ?? deposit.certificateNo}
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

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={PiggyBank}
            title={
              deposits.length === 0 ? 'No fixed deposits recorded' : 'No deposits with this status'
            }
            description={deposits.length === 0 ? undefined : 'Try a different status.'}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((deposit) => (
            <Card
              key={deposit.id}
              className={cn(
                'flex flex-col',
                (deposit.status === 'renewed' || deposit.status === 'closed') && 'opacity-70',
              )}
            >
              <CardHeader
                title={deposit.name ?? deposit.certificateNo}
                description={[
                  deposit.name ? deposit.certificateNo : null,
                  deposit.branch ? `${deposit.bankName}, ${deposit.branch}` : deposit.bankName,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                action={
                  <div className="flex items-center gap-1.5">
                    <DepositStatusBadge status={deposit.status} />

                    {access.canManageDeposits && (
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
                              <DropdownMenuItem onSelect={() => handleRenew(deposit)}>
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
                    )}
                  </div>
                }
              />

              <CardBody className="flex flex-1 flex-col gap-4">
                <div>
                  <p className="text-[11px] text-text-muted">Principal</p>
                  <p className="mt-0.5 text-xl font-semibold leading-none tracking-[-0.02em] text-text-primary tabular">
                    {formatCurrency(deposit.principal)}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <Field label="Purpose">{deposit.poojaName ?? 'General'}</Field>
                  <Field label="Interest Rate">
                    {deposit.interestRate.toFixed(2)}% ·{' '}
                    {INTEREST_PAYOUT_LABELS[deposit.interestPayout]}
                  </Field>
                  <Field label="Matures">
                    {formatLongDate(deposit.maturesOn)}
                    {deposit.status === 'active' && (
                      <span
                        className={cn(
                          'ml-1 tabular',
                          deposit.isOverdue
                            ? 'text-danger'
                            : deposit.isMaturingSoon
                              ? 'text-warning'
                              : 'text-text-muted',
                        )}
                      >
                        {deposit.isOverdue
                          ? `· ${Math.abs(deposit.daysToMaturity)}d overdue`
                          : `· ${deposit.daysToMaturity}d left`}
                      </span>
                    )}
                  </Field>
                  <Field label="Maturity Value">{formatCurrency(deposit.maturityValue)}</Field>
                  <Field label="Interest Received">
                    {formatCurrency(deposit.interestReceived)}
                  </Field>
                  <Field label="Fund">{deposit.fundName}</Field>
                </dl>

                {deposit.bookDifference !== 0 && (
                  <p className="text-[11px] text-warning tabular">
                    Books differ by {formatCurrency(Math.abs(deposit.bookDifference))}
                    {deposit.placementVoucher && ` · ${deposit.placementVoucher.ref} not posted`}
                  </p>
                )}
              </CardBody>

              <CardFooter>
                <LinkButton href={`${FINANCE_ROUTES.fixedDeposits}/${deposit.id}`}>
                  View details
                </LinkButton>
              </CardFooter>
            </Card>
          ))}
        </div>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-xs text-text-secondary">{children}</dd>
    </div>
  );
}
