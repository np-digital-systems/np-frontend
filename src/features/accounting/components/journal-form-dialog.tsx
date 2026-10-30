'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import type { VoucherInput } from '../lib/accounting-actions';
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPES, formatCurrency } from '../lib/accounting-data';
import { journalSchema } from '../lib/accounting-schemas';
import type { AccountRef, EntrySide, FundRef, PartyRef, VoucherRecord } from '../types';
import { PartyPicker } from './party-picker';

interface JournalLine {
  accountId: number;
  side: EntrySide;
  amount: number;
  fundId: number;
}

interface JournalDraft {
  date: string;
  manualVoucherNo: string;
  description: string;
  partyId: number | null;
  party: string;
  lines: JournalLine[];
  notes: string;
}

const round = (value: number) => Math.round(value * 100) / 100;

function blankLine(side: EntrySide, funds: readonly FundRef[]): JournalLine {
  return { accountId: 0, side, amount: 0, fundId: funds[0]?.id ?? 0 };
}

function draftFrom(
  voucher: VoucherRecord | null,
  funds: readonly FundRef[],
  today: string,
): JournalDraft {
  if (voucher) {
    return {
      date: voucher.date,
      manualVoucherNo: voucher.manualVoucherNo ?? '',
      description: voucher.description,
      partyId: voucher.partyId,
      party: voucher.party,
      lines: voucher.lines.map((line) => ({
        accountId: line.accountId,
        side: line.side ?? 'debit',
        amount: line.amount,
        fundId: line.fundId,
      })),
      notes: voucher.notes ?? '',
    };
  }

  return {
    date: today,
    manualVoucherNo: '',
    description: '',
    partyId: null,
    party: '',
    lines: [blankLine('debit', funds), blankLine('credit', funds)],
    notes: '',
  };
}

interface JournalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: VoucherRecord | null;
  /** Never a cash or bank head: those move through receipts, payments and contras. */
  accounts: readonly AccountRef[];
  funds: readonly FundRef[];
  parties: readonly PartyRef[];
  onSubmit: (input: Omit<VoucherInput, 'kind'>) => void;
  onSubmitForApproval?: (input: Omit<VoucherInput, 'kind'>) => void;
}

export function JournalFormDialog({
  open,
  onOpenChange,
  voucher,
  accounts,
  funds,
  parties,
  onSubmit,
  onSubmitForApproval,
}: JournalFormDialogProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [draft, setDraft] = useState<JournalDraft>(() => draftFrom(voucher, funds, today));
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${voucher?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(voucher, funds, today));
    setError(null);
  }

  const total = (side: EntrySide) =>
    round(
      draft.lines
        .filter((line) => line.side === side)
        .reduce((sum, line) => sum + line.amount, 0),
    );

  const debit = total('debit');
  const credit = total('credit');
  const difference = round(debit - credit);

  const accountsByType = ACCOUNT_TYPES.map(
    (type) => [type, accounts.filter((account) => account.type === type)] as const,
  ).filter(([, group]) => group.length > 0);

  function update<K extends keyof JournalDraft>(key: K, value: JournalDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function editLine(index: number, patch: Partial<JournalLine>) {
    setDraft((current) => ({
      ...current,
      lines: current.lines.map((line, at) => (at === index ? { ...line, ...patch } : line)),
    }));
  }

  function toInput(): Omit<VoucherInput, 'kind'> | null {
    const result = validate(journalSchema, draft);

    if (!result.ok) {
      setError(result.message);
      return null;
    }

    setError(null);

    return {
      date: result.data.date,
      description: result.data.description.trim(),
      lines: result.data.lines.map((line) => ({
        accountId: line.accountId,
        amount: line.amount,
        fundId: line.fundId,
        projectId: null,
        activityId: null,
        eventId: null,
        fixedDepositId: null,
        side: line.side,
      })),
      mode: null,
      bankAccountId: null,
      chequeNo: null,
      partyId: result.data.partyId,
      party: result.data.party.trim(),
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{voucher ? `Edit ${voucher.ref}` : 'New Journal Voucher'}</DialogTitle>
          <DialogDescription>No money moves; debits must equal credits.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="journal-date" label="Date" required>
              <Input
                id="journal-date"
                type="date"
                value={draft.date}
                onChange={(changeEvent) => update('date', changeEvent.target.value)}
              />
            </FormField>

            <FormField id="journal-manual-no" label="Manual Voucher No" required>
              <Input
                id="journal-manual-no"
                value={draft.manualVoucherNo}
                onChange={(changeEvent) => update('manualVoucherNo', changeEvent.target.value)}
              />
            </FormField>
          </div>

          <div className="flex flex-col gap-2">
            {draft.lines.map((line, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-surface-2 p-3 sm:grid-cols-[6rem_1fr_8rem]"
              >
                <Select
                  value={line.side}
                  onValueChange={(value) => editLine(index, { side: value as EntrySide })}
                >
                  <SelectTrigger aria-label={`Side of line ${index + 1}`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={line.accountId ? String(line.accountId) : undefined}
                  onValueChange={(value) => editLine(index, { accountId: Number(value) })}
                >
                  <SelectTrigger aria-label={`Account on line ${index + 1}`} className="w-full">
                    <SelectValue placeholder="Ledger account" />
                  </SelectTrigger>

                  <SelectContent position="popper">
                    {accountsByType.map(([type, group]) => (
                      <SelectGroup key={type}>
                        <SelectLabel>{ACCOUNT_TYPE_LABELS[type]}</SelectLabel>

                        {group.map((account) => (
                          <SelectItem key={account.id} value={String(account.id)}>
                            {account.code} · {account.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  aria-label={`Amount on line ${index + 1}`}
                  value={line.amount || ''}
                  onChange={(changeEvent) =>
                    editLine(index, { amount: Number(changeEvent.target.value) || 0 })
                  }
                />

                <div className="flex items-center justify-between gap-2 sm:col-span-3">
                  <Select
                    value={String(line.fundId)}
                    onValueChange={(value) => editLine(index, { fundId: Number(value) })}
                  >
                    <SelectTrigger aria-label={`Fund on line ${index + 1}`} className="w-56">
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

                  {draft.lines.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:bg-danger-subtle hover:text-danger"
                      onClick={() =>
                        update(
                          'lines',
                          draft.lines.filter((_, at) => at !== index),
                        )
                      }
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  update('lines', [
                    ...draft.lines,
                    blankLine(difference > 0 ? 'credit' : 'debit', funds),
                  ])
                }
              >
                <Plus />
                Add line
              </Button>

              <p className="text-xs text-text-secondary tabular">
                Dr {formatCurrency(debit)} · Cr {formatCurrency(credit)}
                <span
                  className={cn(
                    'ml-2 font-medium',
                    difference === 0 ? 'text-success' : 'text-danger',
                  )}
                >
                  {difference === 0
                    ? 'Balanced'
                    : `Difference ${formatCurrency(Math.abs(difference))}`}
                </span>
              </p>
            </div>
          </div>

          <FormField id="journal-party" label="Particulars" required>
            <PartyPicker
              id="journal-party"
              name={draft.party}
              partyId={draft.partyId}
              parties={parties}
              placeholder="Who or what this entry concerns"
              onChange={({ name, partyId }) =>
                setDraft((current) => ({ ...current, party: name, partyId }))
              }
            />
          </FormField>

          <FormField id="journal-description" label="Description" required>
            <Input
              id="journal-description"
              value={draft.description}
              onChange={(changeEvent) => update('description', changeEvent.target.value)}
            />
          </FormField>

          <FormField id="journal-notes" label="Notes">
            <Textarea
              id="journal-notes"
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
