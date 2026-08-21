'use client';

import { useState } from 'react';

import { FormField } from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  formatCurrency,
  formatPeriod,
} from '../lib/contributions-data';
import type { MemberRecord } from '../types';

export interface PaymentDraft {
  period: string;
  amount: number;
  paidOn: string;
  mode: 'cash' | 'bank' | 'online';
}

const MODE_LABELS = {
  cash: 'Cash',
  bank: 'Bank Transfer',
  online: 'Online',
} as const;

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberRecord | null;
  /** Periods of the year this member has not paid for, oldest first. */
  unpaidPeriods: readonly string[];
  today: string;
  onSubmit: (draft: PaymentDraft) => void;
}

/**
 * Take a subscription payment.
 *
 * The period defaults to the oldest one outstanding, because a collector
 * taking money at the counter is almost always clearing the earliest arrear
 * rather than paying ahead — and getting that wrong leaves a gap in the
 * middle of the year that nobody notices until the audit.
 */
export function RecordPaymentDialog({
  open,
  onOpenChange,
  member,
  unpaidPeriods,
  today,
  onSubmit,
}: RecordPaymentDialogProps) {
  const defaults = (): PaymentDraft => ({
    period: unpaidPeriods[0] ?? '',
    amount: member?.subscriptionAmount ?? 0,
    paidOn: today,
    mode: 'cash',
  });

  const [draft, setDraft] = useState<PaymentDraft>(defaults);
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${member?.id ?? 'none'}|${unpaidPeriods[0] ?? ''}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(defaults());
    setError(null);
  }

  const shortfall =
    member !== null && draft.amount > 0
      ? member.subscriptionAmount - draft.amount
      : 0;

  function update<K extends keyof PaymentDraft>(
    key: K,
    value: PaymentDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!draft.period) {
      setError('Choose the period this payment covers.');
      return;
    }

    if (draft.amount <= 0) {
      setError('The amount must be greater than zero.');
      return;
    }

    if (draft.paidOn > today) {
      setError('A payment cannot be recorded in the future.');
      return;
    }

    setError(null);
    onSubmit(draft);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {member && (
          <>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                {member.memberNo} · {member.fullName} — pledged{' '}
                {formatCurrency(member.subscriptionAmount)}{' '}
                {member.frequency === 'monthly' ? 'a month' : 'a year'}.
              </DialogDescription>
            </DialogHeader>

            {member.outstanding > 0 && (
              <div className="rounded-lg bg-warning-subtle px-3.5 py-2.5">
                <p className="text-xs text-warning">
                  Currently{' '}
                  <span className="font-semibold tabular">
                    {formatCurrency(member.outstanding)}
                  </span>{' '}
                  behind across {unpaidPeriods.length}{' '}
                  {unpaidPeriods.length === 1 ? 'period' : 'periods'}.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField
                id="payment-period"
                label="Period"
                required
                hint="Defaults to the oldest period still outstanding."
              >
                {unpaidPeriods.length === 0 ? (
                  <p className="rounded-lg bg-success-subtle px-3 py-2 text-xs text-success">
                    Every period of this year is already paid. A further
                    payment would be an advance for next year.
                  </p>
                ) : (
                  <Select
                    value={draft.period}
                    onValueChange={(value) => update('period', value)}
                  >
                    <SelectTrigger id="payment-period" className="w-full">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {unpaidPeriods.map((period) => (
                        <SelectItem key={period} value={period}>
                          {formatPeriod(period)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField id="payment-amount" label="Amount" required>
                  <Input
                    id="payment-amount"
                    type="number"
                    min={0}
                    step={100}
                    value={draft.amount || ''}
                    onChange={(changeEvent) =>
                      update('amount', Number(changeEvent.target.value) || 0)
                    }
                  />
                </FormField>

                <FormField id="payment-date" label="Received On" required>
                  <Input
                    id="payment-date"
                    type="date"
                    max={today}
                    value={draft.paidOn}
                    onChange={(changeEvent) =>
                      update('paidOn', changeEvent.target.value)
                    }
                  />
                </FormField>
              </div>

              <FormField id="payment-mode" label="Mode" required>
                <Select
                  value={draft.mode}
                  onValueChange={(value) =>
                    update('mode', value as PaymentDraft['mode'])
                  }
                >
                  <SelectTrigger id="payment-mode" className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {(['cash', 'bank', 'online'] as const).map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {MODE_LABELS[mode]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              {shortfall > 0 && (
                <p className="rounded-lg bg-warning-subtle px-3 py-2 text-xs leading-relaxed text-warning">
                  This is {formatCurrency(shortfall)} short of the pledged{' '}
                  {formatCurrency(member.subscriptionAmount)}. The period will
                  be marked paid and the balance will stay outstanding.
                </p>
              )}

              <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-text-secondary">
                Recording this here does not raise the receipt voucher. Enter
                the corresponding receipt in the accounting module so the money
                reaches the ledger.
              </p>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-danger-subtle px-3 py-2 text-xs text-danger"
                >
                  {error}
                </p>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={unpaidPeriods.length === 0}>
                  Record Payment
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
