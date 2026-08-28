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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { BANK_ACCOUNT_TYPE_LABELS } from '../lib/accounting-data';
import { bankAccountSchema } from '../lib/accounting-schemas';
import type { BankAccount, BankAccountType } from '../types';

export interface BankAccountDraft {
  label: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  type: BankAccountType;
  openingBalance: number;
  openedOn: string;
  isActive: boolean;
  /** The asset head every movement of this money posts through. */
  ledgerAccountId: number | null;
}

const TYPES: readonly BankAccountType[] = ['current', 'savings', 'fixed-deposit'];

function draftFrom(bank: BankAccount | null): BankAccountDraft {
  if (bank) {
    return {
      label: bank.label,
      bankName: bank.bankName,
      branch: bank.branch,
      accountNumber: bank.accountNumber,
      type: bank.type,
      openingBalance: bank.openingBalance,
      openedOn: bank.openedOn,
      isActive: bank.isActive,
      ledgerAccountId: bank.ledgerAccountId,
    };
  }

  return {
    label: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    type: 'current',
    openingBalance: 0,
    openedOn: new Date().toISOString().slice(0, 10),
    isActive: true,
    ledgerAccountId: null,
  };
}

interface BankAccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bank: BankAccount | null;
  /** Postable asset heads, one of which this account posts through. */
  ledgerAccounts: readonly { id: number; code: string; name: string }[];
  onSubmit: (draft: BankAccountDraft) => void;
  submitError?: string | null;
}

export function BankAccountFormDialog({
  open,
  onOpenChange,
  bank,
  ledgerAccounts,
  submitError,
  onSubmit,
}: BankAccountFormDialogProps) {
  const [draft, setDraft] = useState<BankAccountDraft>(() => draftFrom(bank));
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${bank?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(bank));
    setError(null);
  }

  function update<K extends keyof BankAccountDraft>(
    key: K,
    value: BankAccountDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(bankAccountSchema, draft);

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {bank ? `Edit ${bank.label}` : 'New Bank Account'}
          </DialogTitle>
          <DialogDescription>
            Bank accounts are where the temple’s money actually sits. Each one
            gets its own book and its own opening balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            id="bank-label"
            label="Label"
            required
            hint="How staff refer to it — shown in every account picker."
          >
            <Input
              id="bank-label"
              value={draft.label}
              placeholder="People's Bank — Current"
              onChange={(changeEvent) =>
                update('label', changeEvent.target.value)
              }
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="bank-name" label="Bank" required>
              <Input
                id="bank-name"
                value={draft.bankName}
                placeholder="People's Bank"
                onChange={(changeEvent) =>
                  update('bankName', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField id="bank-branch" label="Branch">
              <Input
                id="bank-branch"
                value={draft.branch}
                placeholder="Nallur"
                onChange={(changeEvent) =>
                  update('branch', changeEvent.target.value)
                }
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="bank-number"
              label="Account Number"
              required
              hint="Stored masked — only the last four digits are kept."
            >
              <Input
                id="bank-number"
                value={draft.accountNumber}
                placeholder="•••• •••• 4521"
                onChange={(changeEvent) =>
                  update('accountNumber', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField id="bank-type" label="Type" required>
              <Select
                value={draft.type}
                onValueChange={(value) =>
                  update('type', value as BankAccountType)
                }
              >
                <SelectTrigger id="bank-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {BANK_ACCOUNT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="bank-opening"
              label="Opening Balance"
              hint="The balance this account's book starts from."
            >
              <Input
                id="bank-opening"
                type="number"
                min={0}
                step={0.01}
                value={draft.openingBalance || ''}
                onChange={(changeEvent) =>
                  update(
                    'openingBalance',
                    Number(changeEvent.target.value) || 0,
                  )
                }
              />
            </FormField>

            <FormField id="bank-opened" label="Opened On">
              <Input
                id="bank-opened"
                type="date"
                value={draft.openedOn}
                onChange={(changeEvent) =>
                  update('openedOn', changeEvent.target.value)
                }
              />
            </FormField>

            {/*
              * Every movement of this money is a movement on this head, which
              * is what lets the bank book be derived from the ledger rather
              * than kept as a parallel list that can drift out of step.
              */}
            <FormField id="bank-ledger" label="Posts Through" required>
              <select
                id="bank-ledger"
                disabled={bank !== null}
                value={draft.ledgerAccountId === null ? '' : String(draft.ledgerAccountId)}
                onChange={(changeEvent) =>
                  update(
                    'ledgerAccountId',
                    changeEvent.target.value === '' ? null : Number(changeEvent.target.value),
                  )
                }
                className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary disabled:opacity-60"
              >
                <option value="">Choose an asset head…</option>
                {ledgerAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.code} — {account.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {(error ?? submitError) && (
            <p
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger-subtle px-3 py-2 text-sm text-danger"
            >
              {error ?? submitError}
            </p>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="min-w-0 pr-4">
              <Label
                htmlFor="bank-active"
                className="text-xs font-medium text-text-secondary"
              >
                Active
              </Label>
              <p className="mt-0.5 text-[11px] text-text-muted">
                A closed account keeps its book but accepts no new entries.
              </p>
            </div>

            <Switch
              id="bank-active"
              checked={draft.isActive}
              onCheckedChange={(checked) => update('isActive', checked)}
            />
          </div>

          {(error ?? submitError) && (
            <p
              role="alert"
              className="rounded-lg bg-danger-subtle px-3 py-2 text-xs text-danger"
            >
              {error ?? submitError}
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

            <Button type="submit">
              {bank ? 'Save Changes' : 'Add Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
