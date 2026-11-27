'use client';

import { useState } from 'react';

import {
  PAYMENT_MODES,
  PAYMENT_MODE_LABELS,
} from '@/features/accounting/lib/accounting-data';
import type { BankAccountRef, PaymentMode } from '@/features/accounting/types';
import { FormField } from '@/components/portal/ui';
import { validate } from '@/lib/validation';
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

import { interestSchema } from '../lib/finance-schemas';
import type { DepositRecord } from '../types';

export interface InterestDraft {
  amount: number;
  receivedOn: string;
  mode: PaymentMode;
  bankAccountId: number | null;
  chequeNo: string;
  manualVoucherNo: string;
}

function draftFor(
  deposit: DepositRecord | null,
  purpose: 'interest' | 'close',
  today: string,
): InterestDraft {
  return {
    // On closing, the bank usually pays out the maturity value.
    amount: purpose === 'close' ? (deposit?.maturityValue ?? 0) : 0,
    receivedOn: today,
    mode: 'bank',
    bankAccountId: deposit?.bankAccountId ?? null,
    chequeNo: '',
    manualVoucherNo: '',
  };
}

interface RecordInterestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Closing receipts the whole payout; the API splits off the principal. */
  purpose?: 'interest' | 'close';
  deposit: DepositRecord | null;
  bankAccounts: readonly BankAccountRef[];
  today: string;
  onSubmit: (draft: InterestDraft) => void;
}

export function RecordInterestDialog({
  open,
  onOpenChange,
  purpose = 'interest',
  deposit,
  bankAccounts,
  today,
  onSubmit,
}: RecordInterestDialogProps) {
  const closing = purpose === 'close';
  const [draft, setDraft] = useState<InterestDraft>(() => draftFor(deposit, purpose, today));
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${purpose}|${deposit?.id ?? 'none'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFor(deposit, purpose, today));
    setError(null);
  }

  function update<K extends keyof InterestDraft>(key: K, value: InterestDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(interestSchema, draft);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError(null);
    onSubmit(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {deposit && (
          <>
            <DialogHeader>
              <DialogTitle>{closing ? 'Close Deposit' : 'Record Interest'}</DialogTitle>
              <DialogDescription>
                {deposit.certificateNo} · {deposit.poojaName ?? 'General'}.{' '}
                {closing
                  ? 'Enter everything the bank paid out; anything above the principal is interest.'
                  : 'Raised as a receipt voucher for approval.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  id="interest-amount"
                  label={closing ? 'Amount Received' : 'Amount'}
                  required
                >
                  <Input
                    id="interest-amount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={draft.amount || ''}
                    onChange={(changeEvent) =>
                      update('amount', Number(changeEvent.target.value) || 0)
                    }
                  />
                </FormField>

                <FormField id="interest-date" label="Received On" required>
                  <Input
                    id="interest-date"
                    type="date"
                    value={draft.receivedOn}
                    onChange={(changeEvent) =>
                      update('receivedOn', changeEvent.target.value)
                    }
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField id="interest-mode" label="Mode" required>
                  <Select
                    value={draft.mode}
                    onValueChange={(value) => update('mode', value as PaymentMode)}
                  >
                    <SelectTrigger id="interest-mode" className="w-full">
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

                {draft.mode !== 'cash' && (
                  <FormField id="interest-bank" label="Bank Account" required>
                    <Select
                      value={
                        draft.bankAccountId === null
                          ? undefined
                          : String(draft.bankAccountId)
                      }
                      onValueChange={(value) => update('bankAccountId', Number(value))}
                    >
                      <SelectTrigger id="interest-bank" className="w-full">
                        <SelectValue placeholder="Choose an account" />
                      </SelectTrigger>

                      <SelectContent>
                        {bankAccounts.map((account) => (
                          <SelectItem key={account.id} value={String(account.id)}>
                            {account.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField id="interest-voucher-no" label="Manual Voucher No." required>
                  <Input
                    id="interest-voucher-no"
                    value={draft.manualVoucherNo}
                    onChange={(changeEvent) =>
                      update('manualVoucherNo', changeEvent.target.value)
                    }
                  />
                </FormField>

                {draft.mode === 'cheque' && (
                  <FormField id="interest-cheque" label="Cheque No." required>
                    <Input
                      id="interest-cheque"
                      value={draft.chequeNo}
                      onChange={(changeEvent) =>
                        update('chequeNo', changeEvent.target.value)
                      }
                    />
                  </FormField>
                )}
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

                <Button type="submit">{closing ? 'Close Deposit' : 'Raise Receipt'}</Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
