'use client';

import { useState } from 'react';

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
import { Textarea } from '@/components/ui/textarea';

import type { VoucherInput } from '../lib/accounting-actions';
import { PAYMENT_MODE_LABELS } from '../lib/accounting-data';
import { contraSchema } from '../lib/accounting-schemas';
import type { FundRef, MoneyAccount, PaymentMode, VoucherRecord } from '../types';

const CASH_KEY = 'cash';
const BANK_MODES: readonly PaymentMode[] = ['bank', 'cheque', 'online'];

interface ContraDraft {
  date: string;
  manualVoucherNo: string;
  fromKey: string;
  toKey: string;
  amount: number;
  fundId: number;
  mode: PaymentMode;
  chequeNo: string;
  description: string;
  notes: string;
}

function draftFrom(
  voucher: VoucherRecord | null,
  accounts: readonly MoneyAccount[],
  funds: readonly FundRef[],
  today: string,
): ContraDraft {
  if (voucher) {
    const line = voucher.lines[0];

    return {
      date: voucher.date,
      manualVoucherNo: voucher.manualVoucherNo ?? '',
      fromKey: voucher.bankAccountId === null ? CASH_KEY : `bank:${voucher.bankAccountId}`,
      toKey: accounts.find((account) => account.accountId === line?.accountId)?.key ?? '',
      amount: voucher.amount,
      fundId: line?.fundId ?? funds[0]?.id ?? 0,
      mode: voucher.mode ?? 'cash',
      chequeNo: voucher.chequeNo ?? '',
      description: voucher.description,
      notes: voucher.notes ?? '',
    };
  }

  // Banking the cash is the everyday contra.
  const bank = accounts.find((account) => account.bankAccountId !== null);

  return {
    date: today,
    manualVoucherNo: '',
    fromKey: CASH_KEY,
    toKey: bank?.key ?? '',
    amount: 0,
    fundId: funds[0]?.id ?? 0,
    mode: 'cash',
    chequeNo: '',
    description: '',
    notes: '',
  };
}

interface ContraFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: VoucherRecord | null;
  accounts: readonly MoneyAccount[];
  funds: readonly FundRef[];
  onSubmit: (input: Omit<VoucherInput, 'kind'>) => void;
  onSubmitForApproval?: (input: Omit<VoucherInput, 'kind'>) => void;
}

export function ContraFormDialog({
  open,
  onOpenChange,
  voucher,
  accounts,
  funds,
  onSubmit,
  onSubmitForApproval,
}: ContraFormDialogProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [draft, setDraft] = useState<ContraDraft>(() =>
    draftFrom(voucher, accounts, funds, today),
  );
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${voucher?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(voucher, accounts, funds, today));
    setError(null);
  }

  const fromCash = draft.fromKey === CASH_KEY;

  function update<K extends keyof ContraDraft>(key: K, value: ContraDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  // Money leaving the cash box is cash; leaving a bank it is a transfer unless a cheque is drawn.
  function changeFrom(fromKey: string) {
    setDraft((current) => ({
      ...current,
      fromKey,
      mode: fromKey === CASH_KEY ? 'cash' : current.mode === 'cash' ? 'bank' : current.mode,
      chequeNo: fromKey === CASH_KEY ? '' : current.chequeNo,
    }));
  }

  function toInput(): Omit<VoucherInput, 'kind'> | null {
    const result = validate(contraSchema, draft);

    if (!result.ok) {
      setError(result.message);
      return null;
    }

    const from = accounts.find((account) => account.key === result.data.fromKey);
    const to = accounts.find((account) => account.key === result.data.toKey);

    if (!from || !to) {
      setError('Choose both accounts.');
      return null;
    }

    setError(null);

    return {
      date: result.data.date,
      description: result.data.description.trim(),
      lines: [
        {
          accountId: to.accountId,
          amount: result.data.amount,
          fundId: result.data.fundId,
          projectId: null,
          activityId: null,
          eventId: null,
          fixedDepositId: null,
          side: null,
        },
      ],
      mode: from.bankAccountId === null ? 'cash' : result.data.mode,
      bankAccountId: from.bankAccountId,
      chequeNo: result.data.mode === 'cheque' ? result.data.chequeNo.trim() : null,
      party: to.label,
      manualVoucherNo: result.data.manualVoucherNo,
      notes: result.data.notes.trim() || null,
    };
  }

  function handleSave(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const input = toInput();

    if (!input) return;

    onSubmit(input);
    onOpenChange(false);
  }

  function handleSubmitForApproval() {
    const input = onSubmitForApproval ? toInput() : null;

    if (!input || !onSubmitForApproval) return;

    onSubmitForApproval(input);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{voucher ? `Edit ${voucher.ref}` : 'New Contra Voucher'}</DialogTitle>
          <DialogDescription>Not posted to the ledger until approved.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="contra-date" label="Date" required>
              <Input
                id="contra-date"
                type="date"
                value={draft.date}
                onChange={(changeEvent) => update('date', changeEvent.target.value)}
              />
            </FormField>

            <FormField id="contra-manual-no" label="Manual Voucher No" required>
              <Input
                id="contra-manual-no"
                value={draft.manualVoucherNo}
                onChange={(changeEvent) => update('manualVoucherNo', changeEvent.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="contra-from" label="From" required>
              <Select value={draft.fromKey} onValueChange={changeFrom}>
                <SelectTrigger id="contra-from" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.key} value={account.key}>
                      {account.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="contra-to" label="To" required>
              <Select value={draft.toKey} onValueChange={(value) => update('toKey', value)}>
                <SelectTrigger id="contra-to" className="w-full">
                  <SelectValue placeholder="Choose an account" />
                </SelectTrigger>

                <SelectContent>
                  {accounts
                    .filter((account) => account.key !== draft.fromKey)
                    .map((account) => (
                      <SelectItem key={account.key} value={account.key}>
                        {account.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="contra-amount" label="Amount" required>
              <Input
                id="contra-amount"
                type="number"
                min={0}
                step={0.01}
                value={draft.amount || ''}
                onChange={(changeEvent) =>
                  update('amount', Number(changeEvent.target.value) || 0)
                }
              />
            </FormField>

            <FormField id="contra-fund" label="Fund" required>
              <Select
                value={String(draft.fundId)}
                onValueChange={(value) => update('fundId', Number(value))}
              >
                <SelectTrigger id="contra-fund" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {funds.map((fund) => (
                    <SelectItem key={fund.id} value={String(fund.id)}>
                      {fund.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {!fromCash && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField id="contra-mode" label="Mode" required>
                <Select
                  value={draft.mode}
                  onValueChange={(value) => update('mode', value as PaymentMode)}
                >
                  <SelectTrigger id="contra-mode" className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {BANK_MODES.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {PAYMENT_MODE_LABELS[mode]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              {draft.mode === 'cheque' && (
                <FormField id="contra-cheque" label="Cheque Number" required>
                  <Input
                    id="contra-cheque"
                    value={draft.chequeNo}
                    onChange={(changeEvent) => update('chequeNo', changeEvent.target.value)}
                  />
                </FormField>
              )}
            </div>
          )}

          <FormField id="contra-description" label="Description" required>
            <Input
              id="contra-description"
              value={draft.description}
              placeholder="Hundiyal cash banked"
              onChange={(changeEvent) => update('description', changeEvent.target.value)}
            />
          </FormField>

          <FormField id="contra-notes" label="Notes">
            <Textarea
              id="contra-notes"
              rows={2}
              value={draft.notes}
              onChange={(changeEvent) => update('notes', changeEvent.target.value)}
            />
          </FormField>

          {error && (
            <p role="alert" className="rounded-lg bg-danger-subtle px-3 py-2 text-xs text-danger">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" variant="secondary">
              Save as Draft
            </Button>

            {onSubmitForApproval && (
              <Button type="button" onClick={handleSubmitForApproval}>
                Save &amp; Submit
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
