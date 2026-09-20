'use client';

import { Check, Clock, FileText, Info, Send, X } from 'lucide-react';

import { StatusBadge } from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PortalUser } from '@/features/auth/types/user';
import { cn } from '@/lib/utils';

import {
  PAYMENT_MODE_LABELS,
  formatCurrency,
  formatLongDate,
  partyLabel,
} from '../lib/accounting-data';
import {
  SELF_APPROVAL_MESSAGE,
  canApproveVoucher,
  type AccountingAccess,
} from '../lib/accounting-access';
import { STATUS_MEANING } from '../lib/voucher-workflow';
import type { VoucherRecord } from '../types';

interface VoucherDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: VoucherRecord | null;
  access: AccountingAccess;
  user: PortalUser;
  onApprove: (voucher: VoucherRecord) => void;
  onReject: (voucher: VoucherRecord) => void;
}

export function VoucherDetailDialog({
  open,
  onOpenChange,
  voucher,
  access,
  user,
  onApprove,
  onReject,
}: VoucherDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {voucher && (
          <>
            <DialogHeader>
              {/*
                * The close button is absolutely positioned at top-2 right-2, so
                * the badge needs room to its left or the two sit on top of each
                * other. `min-w-0` lets a long ref truncate rather than shove
                * the badge under it.
                */}
              <div className="flex items-center justify-between gap-3 pr-7">
                <DialogTitle className="ref min-w-0 truncate">
                  {voucher.ref}
                </DialogTitle>
                <StatusBadge status={voucher.status} />
              </div>

              <DialogDescription>
                {STATUS_MEANING[voucher.status]}
              </DialogDescription>
            </DialogHeader>

            {/*
              * The figure is what the reader came for, so it leads — and it is
              * the one place the kind is spelled out in words, which is what
              * tells a receipt from a payment at a glance.
              */}
            <div className="rounded-lg border border-border bg-surface-2 px-4 py-3.5">
              <p className="text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
                {voucher.kind === 'receipt' ? 'Amount received' : 'Amount paid'}
              </p>
              <p className="mt-1 text-2xl leading-none font-semibold tracking-[-0.02em] text-text-primary tabular">
                {formatCurrency(voucher.amount)}
              </p>
            </div>

            <Section title="Details">
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <Detail label="Date" value={formatLongDate(voucher.date)} />
                {/*
                  * Always shown, dash and all. It is the number on the paper the
                  * payer is holding, so "there isn't one" is itself worth seeing
                  * — a row that simply vanished read as though nobody had looked.
                  */}
                <Detail
                  label="Manual Voucher No"
                  value={voucher.manualVoucherNo || '—'}
                />
                <Detail
                  label={partyLabel(voucher.kind)}
                  value={voucher.party}
                />
                <Detail
                  label="Mode"
                  value={PAYMENT_MODE_LABELS[voucher.mode]}
                />

                {voucher.bankAccount && (
                  <Detail
                    label="Bank Account"
                    value={voucher.bankAccount.label}
                  />
                )}

                {voucher.chequeNo && (
                  <Detail label="Cheque No" value={voucher.chequeNo} />
                )}
              </dl>
            </Section>

            {/*
              * The coding, given its own block and its own lines.
              *
              * Account, fund and project used to be crammed into one truncating
              * cell, so the fund a receipt posts against — a legal boundary —
              * was the first thing cut off. Every head is listed: a split
              * voucher showing one would describe a different entry from the
              * one that posted.
              */}
            <Section
              title={voucher.lines.length > 1 ? 'Ledger coding' : 'Ledger account'}
            >
              <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
                {voucher.lines.map((line) => (
                  <div key={line.id} className="px-3.5 py-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="min-w-0 text-[13px] text-text-primary">
                        <span className="ref text-text-secondary">
                          {line.account.code}
                        </span>
                        <span className="mx-1.5 text-text-disabled">·</span>
                        {line.account.name}
                      </p>

                      {voucher.lines.length > 1 && (
                        <p className="shrink-0 text-[13px] font-medium text-text-primary tabular">
                          {formatCurrency(line.amount)}
                        </p>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-text-secondary">
                      {line.fund.name}
                      {line.project && (
                        <>
                          <span className="mx-1.5 text-text-disabled">·</span>
                          <span className="text-text-muted">
                            {line.project.name}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Description">
              <p className="text-[13px] leading-relaxed text-text-primary">
                {voucher.description}
              </p>
            </Section>

            {voucher.notes && (
              <Section title="Notes">
                <p className="text-[13px] leading-relaxed text-text-secondary">
                  {voucher.notes}
                </p>
              </Section>
            )}

            {voucher.rejectionReason && (
              <div className="rounded-lg bg-danger-subtle px-3.5 py-2.5">
                <p className="text-[11px] font-semibold text-danger">
                  Reason for rejection
                </p>
                <p className="mt-1 text-xs leading-relaxed text-danger">
                  {voucher.rejectionReason}
                </p>
              </div>
            )}

            <Trail voucher={voucher} />

            <VoucherDecision
              voucher={voucher}
              access={access}
              user={user}
              onApprove={() => {
                onApprove(voucher);
                onOpenChange(false);
              }}
              onReject={() => {
                onReject(voucher);
                onOpenChange(false);
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Deciding on the entry you are looking at.
 *
 * An approver reads the detail to make up their mind, so this is where the
 * decision belongs — sending them back to hunt for the right row afterwards is
 * how the wrong voucher gets approved. Where they may not act, the reason is
 * stated rather than left as a dead disabled row in a menu.
 */
function VoucherDecision({
  voucher,
  access,
  user,
  onApprove,
  onReject,
}: {
  voucher: VoucherRecord;
  access: AccountingAccess;
  user: PortalUser;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (canApproveVoucher(voucher, access, user)) {
    return (
      <DialogFooter>
        <Button variant="outline" onClick={onReject}>
          Reject
        </Button>
        <Button onClick={onApprove}>Approve</Button>
      </DialogFooter>
    );
  }

  const isOwnPending =
    access.canApprove &&
    voucher.status === 'Pending Approval' &&
    voucher.createdBy.id === user.id;

  if (isOwnPending) {
    return (
      <p className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-xs leading-relaxed text-text-secondary">
        <Info className="mt-px size-3.5 shrink-0 text-text-muted" aria-hidden />
        {SELF_APPROVAL_MESSAGE}
      </p>
    );
  }

  return null;
}

/**
 * One labelled block of the sheet.
 *
 * The dialog carries three scales and they were being used interchangeably:
 * a section heading, a field label and a value. Pinning the heading here is
 * what keeps Description sitting at the same level as Ledger account rather
 * than looking like a stray field between them.
 */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-[13px] text-text-primary">{value}</dd>
    </div>
  );
}

interface TrailStep {
  readonly icon: typeof Check;
  readonly label: string;
  readonly detail: string;
  readonly tone: 'done' | 'rejected';
}

function Trail({ voucher }: { voucher: VoucherRecord }) {
  const steps: TrailStep[] = [
    {
      icon: FileText,
      label: 'Created',
      detail: `${voucher.createdBy.name} · ${formatStamp(voucher.createdAt)}`,
      tone: 'done',
    },
  ];

  if (voucher.submittedAt) {
    steps.push({
      icon: Send,
      label: 'Submitted for approval',
      detail: formatStamp(voucher.submittedAt),
      tone: 'done',
    });
  }

  if (voucher.decidedAt && voucher.decidedBy) {
    steps.push({
      icon: voucher.status === 'Rejected' ? X : Check,
      label: voucher.status === 'Rejected' ? 'Rejected' : 'Approved',
      detail: `${voucher.decidedBy.name} · ${formatStamp(voucher.decidedAt)}`,
      tone: voucher.status === 'Rejected' ? 'rejected' : 'done',
    });
  }

  if (voucher.postedAt) {
    steps.push({
      icon: Check,
      label: 'Posted to ledger',
      detail: formatStamp(voucher.postedAt),
      tone: 'done',
    });
  }

  if (!voucher.submittedAt) {
    steps.push({
      icon: Clock,
      label: 'Awaiting submission',
      detail: 'Has not entered the approval chain',
      tone: 'done',
    });
  }

  return (
    <div className="border-t border-border pt-3.5">
      <h3 className="mb-2.5 text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
        Trail
      </h3>

      <ol className="flex flex-col gap-2.5">
        {steps.map((step) => (
          <li key={step.label} className="flex items-start gap-2.5">
            <span
              className={cn(
                'mt-px flex size-5 shrink-0 items-center justify-center rounded-full',
                step.tone === 'rejected'
                  ? 'bg-danger-subtle text-danger'
                  : 'bg-neutral-subtle text-text-secondary',
              )}
              aria-hidden
            >
              <step.icon className="size-3" />
            </span>

            <div className="min-w-0">
              <p className="text-xs font-medium text-text-primary">
                {step.label}
              </p>
              <p className="text-[11px] text-text-muted tabular">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function formatStamp(stamp: string): string {
  const [date, time = ''] = stamp.split('T');
  const [rawHour, minute] = time.split(':');

  if (!rawHour) return formatLongDate(date);

  const hour24 = Number(rawHour);
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${formatLongDate(date)}, ${hour}:${minute} ${suffix}`;
}
