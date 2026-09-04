'use client';

import { Check, Clock, FileText, Send, X } from 'lucide-react';

import { StatusBadge } from '@/components/portal/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import {
  PAYMENT_MODE_LABELS,
  formatCurrency,
  formatLongDate,
  partyLabel,
} from '../lib/accounting-data';
import { STATUS_MEANING } from '../lib/voucher-workflow';
import type { VoucherRecord } from '../types';

interface VoucherDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: VoucherRecord | null;
}

export function VoucherDetailDialog({
  open,
  onOpenChange,
  voucher,
}: VoucherDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {voucher && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="ref">{voucher.ref}</DialogTitle>
                <StatusBadge status={voucher.status} />
              </div>

              <DialogDescription>
                {STATUS_MEANING[voucher.status]}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg bg-surface-2 px-4 py-3">
              <p className="text-xs text-text-muted">
                {voucher.kind === 'receipt' ? 'Amount received' : 'Amount paid'}
              </p>
              <p className="mt-0.5 text-2xl font-semibold leading-none tracking-[-0.02em] text-text-primary tabular">
                {formatCurrency(voucher.amount)}
              </p>
            </div>

            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <Detail label="Date" value={formatLongDate(voucher.date)} />
              {voucher.manualVoucherNo && (
                <Detail
                  label="Manual Voucher No"
                  value={voucher.manualVoucherNo}
                />
              )}
              <Detail label={partyLabel(voucher.kind)} value={voucher.party} />
              {/*
                * Every head, not just the first: a split voucher that showed
                * one would be describing a different entry from the one posted.
                */}
              {voucher.lines.map((line) => (
                <Detail
                  key={line.id}
                  label={
                    voucher.lines.length > 1
                      ? `Head ${line.lineNo} · ${formatCurrency(line.amount)}`
                      : 'Ledger Account'
                  }
                  value={
                    `${line.account.code} · ${line.account.name}` +
                    ` — ${line.fund.name}` +
                    (line.project ? ` / ${line.project.name}` : '')
                  }
                />
              ))}
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

            <div>
              <p className="text-xs text-text-muted">Description</p>
              <p className="mt-0.5 text-[13px] text-text-primary">
                {voucher.description}
              </p>
            </div>

            {voucher.notes && (
              <div>
                <p className="text-xs text-text-muted">Notes</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">
                  {voucher.notes}
                </p>
              </div>
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
          </>
        )}
      </DialogContent>
    </Dialog>
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
    <div className="border-t border-border pt-3">
      <p className="mb-2.5 text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
        Trail
      </p>

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
