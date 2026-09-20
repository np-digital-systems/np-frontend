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

import { movementSchema } from '../lib/costing-schemas';

type PaymentMode = 'cash' | 'bank' | 'cheque' | 'online';

const MODES: readonly { value: PaymentMode; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'online', label: 'Online' },
];

/** Everything except cash moves through a named bank account. */
const THROUGH_BANK: readonly PaymentMode[] = ['bank', 'cheque', 'online'];

export interface MovementDraft {
  date: string;
  mode: PaymentMode;
  bankAccountId: number | null;
  chequeNo: string;
  manualVoucherNo: string;
  amount: number;
}

interface RaiseVoucherDialogProps {
  kind: 'receipt' | 'payment';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  defaultAmount: number;
  /** The budget does not say who is paid, so the cashier names them. */
  needsPayee?: boolean;
  bankAccounts: readonly { id: number; label: string }[];
  onSubmit: (movement: MovementDraft, extras?: { party?: string }) => void;
}

/**
 * The form that finishes a voucher the budget has already filled in.
 *
 * Three things are asked for and not one of them is decoration. The date and
 * the mode are what the budget cannot know, and the book number is what the
 * audit is done against — the temple's paper voucher book is the record the
 * system is matched to, so a voucher raised from a budget carries one exactly
 * like a voucher typed from nothing.
 */
export function RaiseVoucherDialog({
  kind,
  open,
  onOpenChange,
  title,
  description,
  defaultAmount,
  needsPayee = false,
  bankAccounts,
  onSubmit,
}: RaiseVoucherDialogProps) {
  const [draft, setDraft] = useState<MovementDraft>(() => blank(defaultAmount));
  const [party, setParty] = useState('');
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${defaultAmount}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(blank(defaultAmount));
    setParty('');
    setError(null);
  }

  const throughBank = THROUGH_BANK.includes(draft.mode);

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(movementSchema, {
      date: draft.date,
      mode: draft.mode,
      bankAccountId: draft.bankAccountId,
      chequeNo: draft.chequeNo,
      manualVoucherNo: draft.manualVoucherNo,
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (throughBank && draft.bankAccountId === null) {
      setError('Name the bank account the money moved through.');
      return;
    }

    if (draft.mode === 'cheque' && !draft.chequeNo.trim()) {
      setError('A cheque voucher carries the cheque number.');
      return;
    }

    if (needsPayee && !party.trim()) {
      setError('Name who is being paid.');
      return;
    }

    setError(null);
    onSubmit(draft, needsPayee ? { party: party.trim() } : undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="voucher-date" label="Date" required>
              <Input
                id="voucher-date"
                type="date"
                value={draft.date}
                onChange={(changeEvent) =>
                  setDraft((current) => ({
                    ...current,
                    date: changeEvent.target.value,
                  }))
                }
              />
            </FormField>

            <FormField
              id="voucher-amount"
              label="Amount"
              required
              hint={
                kind === 'payment'
                  ? 'Filled in from the budget. Change it to what was really paid.'
                  : 'Filled in from the quote. Change it if the family rounded up.'
              }
            >
              <Input
                id="voucher-amount"
                type="number"
                min={0}
                step="0.01"
                value={draft.amount || ''}
                onChange={(changeEvent) =>
                  setDraft((current) => ({
                    ...current,
                    amount: Number(changeEvent.target.value) || 0,
                  }))
                }
              />
            </FormField>
          </div>

          {needsPayee && (
            <FormField
              id="voucher-party"
              label="Paid to"
              required
              hint="The budget does not name a payee for this line."
            >
              <Input
                id="voucher-party"
                value={party}
                onChange={(changeEvent) => setParty(changeEvent.target.value)}
              />
            </FormField>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="voucher-mode" label="How the money moved" required>
              <Select
                value={draft.mode}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    mode: value as PaymentMode,
                    bankAccountId: THROUGH_BANK.includes(value as PaymentMode)
                      ? current.bankAccountId
                      : null,
                  }))
                }
              >
                <SelectTrigger id="voucher-mode" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {MODES.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/*
              * Required on every entry, filled in by nobody but the person
              * holding the book. The paper is what the audit is done against,
              * and auto-fill must not become the reason a voucher exists with
              * no paper behind it.
              */}
            <FormField
              id="voucher-book-no"
              label="Voucher book number"
              required
              hint="The number written on the temple’s paper voucher."
            >
              <Input
                id="voucher-book-no"
                value={draft.manualVoucherNo}
                placeholder={kind === 'receipt' ? 'RV / 0412' : 'PV / 0188'}
                onChange={(changeEvent) =>
                  setDraft((current) => ({
                    ...current,
                    manualVoucherNo: changeEvent.target.value,
                  }))
                }
              />
            </FormField>
          </div>

          {throughBank && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField id="voucher-bank" label="Bank account" required>
                <Select
                  value={
                    draft.bankAccountId === null
                      ? undefined
                      : String(draft.bankAccountId)
                  }
                  onValueChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      bankAccountId: Number(value),
                    }))
                  }
                >
                  <SelectTrigger id="voucher-bank" className="w-full">
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

              {draft.mode === 'cheque' && (
                <FormField id="voucher-cheque" label="Cheque number" required>
                  <Input
                    id="voucher-cheque"
                    value={draft.chequeNo}
                    onChange={(changeEvent) =>
                      setDraft((current) => ({
                        ...current,
                        chequeNo: changeEvent.target.value,
                      }))
                    }
                  />
                </FormField>
              )}
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-danger-subtle px-3 py-2 text-xs text-danger"
            >
              {error}
            </p>
          )}

          <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-text-secondary">
            This is raised as a draft. It goes through approval like every other
            voucher — filling the form in saves typing, never the second pair of
            eyes.
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit">Create Draft</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function blank(amount: number): MovementDraft {
  return {
    date: new Date().toISOString().slice(0, 10),
    mode: 'cash',
    bankAccountId: null,
    chequeNo: '',
    manualVoucherNo: '',
    amount,
  };
}
