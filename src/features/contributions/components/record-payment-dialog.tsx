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
import { validate } from '@/lib/validation';

import {
  PAYMENT_MODES,
  PAYMENT_MODE_LABELS,
  YEARLY_SUBSCRIPTION,
  formatCurrency,
  getToday,
} from '../lib/contributions-data';
import { paymentSchema } from '../lib/contributions-schemas';
import type { MemberRecord, PaymentMode } from '../types';

export interface PaymentDraft {
  amount: number;
  paidOn: string;
  mode: PaymentMode;
  receiptRef: string;
}

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberRecord | null;
  year: number;
  onSubmit: (draft: PaymentDraft) => void;
}

/** Records the one subscription a member owes for the year. */
export function RecordPaymentDialog({
  open,
  onOpenChange,
  member,
  year,
  onSubmit,
}: RecordPaymentDialogProps) {
  const [draft, setDraft] = useState<PaymentDraft>({
    amount: YEARLY_SUBSCRIPTION,
    paidOn: getToday(),
    mode: 'cash',
    receiptRef: '',
  });
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${member?.id ?? ''}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft({
      amount: YEARLY_SUBSCRIPTION,
      paidOn: getToday(),
      mode: 'cash',
      receiptRef: '',
    });
    setError(null);
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(paymentSchema, draft);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError(null);
    onSubmit(draft);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record {year} Subscription</DialogTitle>
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
              hint={`Standard subscription is ${formatCurrency(YEARLY_SUBSCRIPTION)}.`}
            >
              <Input
                id="payment-amount"
                type="number"
                min={0}
                step={100}
                value={draft.amount || ''}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    amount: Number(event.target.value) || 0,
                  }))
                }
              />
            </FormField>

            <FormField id="payment-date" label="Paid On" required>
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

            <FormField id="payment-receipt" label="Receipt No">
              <Input
                id="payment-receipt"
                value={draft.receiptRef}
                placeholder="RV-2026-0101"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    receiptRef: event.target.value,
                  }))
                }
              />
            </FormField>
          </div>

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
            <Button type="submit">Record Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
