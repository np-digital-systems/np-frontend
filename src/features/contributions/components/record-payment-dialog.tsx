'use client';

import { useState, useTransition } from 'react';

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
import { validate } from '@/lib/validation';

import {
  PAYMENT_MODES,
  PAYMENT_MODE_LABELS,
  formatCurrency,
  getToday,
} from '../lib/contributions-data';
import {
  recordSanththaPayment,
  updateSanththaPayment,
} from '../lib/contributions-actions';
import { paymentSchema } from '../lib/contributions-schemas';
import type {
  MemberRecord,
  PaymentMode,
  SanththaPayment,
  SanththaPosting,
} from '../types';

export interface PaymentDraft {
  amount: number;
  paidOn: string;
  mode: PaymentMode;
  manualVoucherNo: string;
}

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberRecord | null;
  year: number;
  /** The rate set for the year — the amount the form opens on. */
  rate: number | null;
  /**
   * Where the receipt will land, read from the server rather than assumed.
   * Null while it is still loading.
   */
  posting: SanththaPosting | null;
  /**
   * Correcting a subscription already taken, rather than taking a new one.
   *
   * The member and the year are not editable here: those identify the row, and
   * changing them would be a different subscription, not a correction.
   */
  editing: SanththaPayment | null;
  /** Receives the reference of the receipt voucher the server raised. */
  onRecorded: (receiptRef: string | null) => void;
}

/** Records the one subscription a sponsor owes for the year. */
export function RecordPaymentDialog({
  open,
  onOpenChange,
  member,
  year,
  rate,
  posting,
  editing,
  onRecorded,
}: RecordPaymentDialogProps) {
  // A correction opens on what was taken; a new subscription on the year's
  // rate and today.
  const seedDraft = (): PaymentDraft =>
    editing
      ? {
          amount: editing.amount,
          paidOn: editing.paidOn,
          mode: editing.mode,
          manualVoucherNo: editing.manualVoucherNo ?? '',
        }
      : {
          amount: rate ?? 0,
          paidOn: getToday(),
          mode: 'cash',
          manualVoucherNo: '',
        };

  const [draft, setDraft] = useState<PaymentDraft>(seedDraft);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const seed = `${open}|${member?.id ?? ''}|${editing?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(seedDraft());
    setError(null);
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!member) return;

    const parsed = validate(paymentSchema, draft);

    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = editing
        ? await updateSanththaPayment(editing.id, draft)
        : await recordSanththaPayment({
            memberId: member.id,
            memberNo: member.memberNo,
            memberName: member.fullName,
            year,
            ...draft,
          });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      onRecorded(result.receiptRef);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? `Edit ${year} Subscription` : `Record ${year} Subscription`}
          </DialogTitle>
          <DialogDescription>
            {member
              ? `${member.memberNo} · ${member.fullName}`
              : 'Record the yearly sanththa subscription.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="payment-amount"
              label="Amount"
              required
              hint={
                rate === null
                  ? `No sanththa has been set for ${year}.`
                  : `The ${year} sanththa is ${formatCurrency(rate)}.`
              }
            >
              <Input
                id="payment-amount"
                type="number"
                min={0}
                step={0.01}
                value={draft.amount || ''}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    amount: Number(event.target.value) || 0,
                  }))
                }
              />
            </FormField>

            <FormField id="payment-date" label="Received On" required>
              <Input
                id="payment-date"
                type="date"
                value={draft.paidOn}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    paidOn: event.target.value,
                  }))
                }
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="payment-mode" label="Mode" required>
              <Select
                value={draft.mode}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    mode: value as PaymentMode,
                  }))
                }
              >
                <SelectTrigger id="payment-mode" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {PAYMENT_MODES.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {PAYMENT_MODE_LABELS[mode]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/*
              * The number off the paper receipt book — the one the member walks
              * away holding. Required, so every subscription in the system can
              * be matched against the paper it was written on.
              */}
            <FormField
              id="payment-manual-no"
              label="Receipt book number"
              required
              hint="From the printed receipt book"
            >
              <Input
                id="payment-manual-no"
                value={draft.manualVoucherNo}
                maxLength={32}
                placeholder="e.g. 1234"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    manualVoucherNo: event.target.value,
                  }))
                }
              />
            </FormField>
          </div>

          {/*
            * What the server will actually do, not what this file believes it
            * will do. An unconfigured head says so here, before the money is
            * taken, rather than failing on save.
            */}
          {posting === null ? (
            <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-text-secondary">
              Checking where this will be receipted…
            </p>
          ) : posting.configured ? (
            <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-text-secondary">
              {editing ? 'Corrects the receipt raised to' : 'Raises a receipt voucher to'}{' '}
              <span className="font-medium text-text-primary">
                {posting.accountCode} · {posting.accountName}
              </span>{' '}
              against the {posting.fundName}
              {posting.activityName && <> · {posting.activityName}</>}, received
              from{' '}
              <span className="font-medium text-text-primary">
                {member?.fullName ?? 'the member'}
              </span>
              .{' '}
              {editing
                ? 'The corrected receipt returns to the Approval Centre, so it is reviewed again before it reaches the ledger.'
                : 'The receipt number is allocated when it is saved, and it goes to the Approval Centre — nothing reaches the ledger until it is approved and posted.'}
            </p>
          ) : (
            <p
              role="alert"
              className="rounded-lg bg-warning-subtle px-3 py-2 text-xs leading-relaxed text-text-secondary"
            >
              {posting.problem ??
                'Subscriptions have nowhere to post yet. Set the sanththa head in the accounting settings.'}
            </p>
          )}

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
            <Button type="submit" disabled={pending}>
              {editing
                ? pending
                  ? 'Saving…'
                  : 'Save Changes'
                : pending
                  ? 'Recording…'
                  : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
