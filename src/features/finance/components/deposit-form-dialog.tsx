'use client';

import { useState } from 'react';

import { FormField } from '@/components/portal/ui';
import {
  EntityCombobox,
  type EntityGroup,
  type EntityOption,
} from '@/components/ui/entity-combobox';
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
import {
  PAYMENT_MODES,
  PAYMENT_MODE_LABELS,
} from '@/features/accounting/lib/accounting-data';
import type { BankAccountRef, PaymentMode } from '@/features/accounting/types';

import {
  INTEREST_PAYOUTS,
  INTEREST_PAYOUT_LABELS,
  addMonthsIso,
  formatCurrency,
  formatLongDate,
  simpleInterest,
  yearsBetween,
} from '../lib/finance-data';
import { depositSchema, placementSchema } from '../lib/finance-schemas';
import type { PlacementInput } from '../lib/finance-actions';
import type {
  DepositRecord,
  FundRecord,
  InterestPayout,
  SlotOption,
} from '../types';

function poojaGroups(slots: readonly SlotOption[]): EntityGroup[] {
  const groups = new Map<number, { heading: string; options: EntityOption[] }>();

  for (const slot of slots) {
    const group = groups.get(slot.poojaTypeId) ?? {
      heading: slot.poojaTypeName,
      options: [],
    };

    group.options.push({
      value: String(slot.id),
      label: slot.poojaName,
      description: slot.sponsorName ?? undefined,
      keywords: slot.poojaTypeName,
    });
    groups.set(slot.poojaTypeId, group);
  }

  return [...groups.values()];
}

const SOURCE_LABELS: Record<PlacementInput['source'], string> = {
  bank: 'Kovil money',
  endowment: 'Sponsor placed it',
  opening: 'Held before go-live',
};

export type DepositPurpose = 'place' | 'edit' | 'renew';

export interface DepositDraft {
  certificateNo: string;
  bankName: string;
  branch: string;
  principal: number;
  interestRate: number;
  placedOn: string;
  tenureMonths: number;
  interestPayout: InterestPayout;
  fundId: number;
  forPooja: boolean;
  slotId: number | null;
  notes: string;
  source: PlacementInput['source'];
  mode: PaymentMode;
  fromBankAccountId: number | null;
  chequeNo: string;
  manualVoucherNo: string;
}

function draftFrom(
  deposit: DepositRecord | null,
  funds: readonly FundRecord[],
  bankAccounts: readonly BankAccountRef[],
  today: string,
): DepositDraft {
  const placement = {
    source: 'bank' as const,
    mode: 'bank' as const,
    fromBankAccountId: deposit?.bankAccountId ?? bankAccounts[0]?.id ?? null,
    chequeNo: '',
    manualVoucherNo: '',
  };

  if (deposit) {
    return {
      certificateNo: deposit.certificateNo,
      bankName: deposit.bankName,
      branch: deposit.branch,
      principal: deposit.principal,
      interestRate: deposit.interestRate,
      placedOn: deposit.placedOn,
      tenureMonths: deposit.tenureMonths,
      interestPayout: deposit.interestPayout,
      fundId: deposit.fundId,
      forPooja: deposit.slotId !== null,
      slotId: deposit.slotId,
      notes: deposit.notes ?? '',
      ...placement,
    };
  }

  return {
    certificateNo: '',
    bankName: '',
    branch: '',
    principal: 0,
    interestRate: 0,
    placedOn: today,
    tenureMonths: 12,
    interestPayout: 'on-maturity',
    fundId: funds[0]?.id ?? 0,
    forPooja: false,
    slotId: null,
    notes: '',
    ...placement,
  };
}

export function maturityDate(placedOn: string, tenureMonths: number): string {
  return addMonthsIso(placedOn, tenureMonths);
}

interface DepositFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purpose: DepositPurpose;
  deposit: DepositRecord | null;
  funds: readonly FundRecord[];
  bankAccounts: readonly BankAccountRef[];
  slots: readonly SlotOption[];
  existing: readonly DepositRecord[];
  onSubmit: (draft: DepositDraft) => void;
}

export function DepositFormDialog({
  open,
  onOpenChange,
  purpose,
  deposit,
  funds,
  bankAccounts,
  slots,
  existing,
  onSubmit,
}: DepositFormDialogProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [draft, setDraft] = useState<DepositDraft>(() =>
    draftFrom(deposit, funds, bankAccounts, today),
  );
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${purpose}|${deposit?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(deposit, funds, bankAccounts, today));
    setError(null);
  }

  const matures = draft.placedOn
    ? maturityDate(draft.placedOn, draft.tenureMonths)
    : '';

  const interest =
    matures && draft.principal > 0
      ? simpleInterest(
          draft.principal,
          draft.interestRate,
          yearsBetween(draft.placedOn, matures),
        )
      : 0;

  function update<K extends keyof DepositDraft>(
    key: K,
    value: DepositDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(depositSchema, {
      ...draft,
      slotId: draft.forPooja ? draft.slotId : null,
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (draft.forPooja && result.data.slotId === null) {
      setError('Choose the pooja this deposit pays for.');
      return;
    }

    const clash = existing.some(
      (entry) =>
        entry.certificateNo.toLowerCase() ===
          result.data.certificateNo.toLowerCase() && entry.id !== deposit?.id,
    );

    if (clash) {
      setError(`Certificate ${result.data.certificateNo} is already recorded.`);
      return;
    }

    if (purpose === 'place') {
      const placement = validate(placementSchema, draft);

      if (!placement.ok) {
        setError(placement.message);
        return;
      }
    }

    if (purpose === 'renew' && !draft.manualVoucherNo.trim()) {
      setError('Enter the manual voucher number for the renewal.');
      return;
    }

    setError(null);
    onSubmit({ ...draft, ...result.data, manualVoucherNo: draft.manualVoucherNo.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {purpose === 'renew' && deposit
              ? `Renew ${deposit.certificateNo}`
              : deposit
                ? `Edit ${deposit.certificateNo}`
                : 'Place Fixed Deposit'}
          </DialogTitle>
          <DialogDescription>
            {purpose === 'renew'
              ? 'Enter the new certificate. A journal moves the principal across.'
              : 'Record it against the fund the money came from.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            id="deposit-certificate"
            label="Certificate Number"
            required
          >
            <Input
              id="deposit-certificate"
              value={draft.certificateNo}
              placeholder="HNB/FD/2026/1234"
              onChange={(changeEvent) =>
                update('certificateNo', changeEvent.target.value)
              }
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="deposit-bank" label="Bank" required>
              <Input
                id="deposit-bank"
                value={draft.bankName}
                placeholder="Hatton National Bank"
                onChange={(changeEvent) =>
                  update('bankName', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField id="deposit-branch" label="Branch">
              <Input
                id="deposit-branch"
                value={draft.branch}
                placeholder="Colombo 06"
                onChange={(changeEvent) =>
                  update('branch', changeEvent.target.value)
                }
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="deposit-principal" label="Principal" required>
              <Input
                id="deposit-principal"
                type="number"
                min={0}
                step={0.01}
                value={draft.principal || ''}
                onChange={(changeEvent) =>
                  update('principal', Number(changeEvent.target.value) || 0)
                }
              />
            </FormField>

            <FormField
              id="deposit-rate"
              label="Interest Rate"
              required
              hint="Annual rate, as a percentage."
            >
              <Input
                id="deposit-rate"
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={draft.interestRate || ''}
                placeholder="12.5"
                onChange={(changeEvent) =>
                  update('interestRate', Number(changeEvent.target.value) || 0)
                }
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="deposit-placed" label="Placed On" required>
              <Input
                id="deposit-placed"
                type="date"
                value={draft.placedOn}
                onChange={(changeEvent) =>
                  update('placedOn', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField
              id="deposit-tenure"
              label="Tenure (months)"
              required
              hint="Sets the maturity date."
            >
              <Input
                id="deposit-tenure"
                type="number"
                min={1}
                max={120}
                value={draft.tenureMonths || ''}
                onChange={(changeEvent) =>
                  update('tenureMonths', Number(changeEvent.target.value) || 1)
                }
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="deposit-payout" label="Interest Payout" required>
              <Select
                value={draft.interestPayout}
                onValueChange={(value) =>
                  update('interestPayout', value as InterestPayout)
                }
              >
                <SelectTrigger id="deposit-payout" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {INTEREST_PAYOUTS.map((payout) => (
                    <SelectItem key={payout} value={payout}>
                      {INTEREST_PAYOUT_LABELS[payout]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="deposit-fund" label="Fund" required>
              <Select
                value={String(draft.fundId)}
                onValueChange={(value) => update('fundId', Number(value))}
              >
                <SelectTrigger id="deposit-fund" className="w-full">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[10rem_1fr]">
            <FormField id="deposit-purpose" label="Purpose" required>
              <Select
                value={draft.forPooja ? 'pooja' : 'general'}
                onValueChange={(value) => update('forPooja', value === 'pooja')}
              >
                <SelectTrigger id="deposit-purpose" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="pooja">Pooja</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {draft.forPooja && (
              <FormField id="deposit-pooja" label="Pooja" required>
                <EntityCombobox
                  id="deposit-pooja"
                  value={draft.slotId === null ? null : String(draft.slotId)}
                  groups={poojaGroups(slots)}
                  placeholder="Choose the pooja"
                  searchPlaceholder="Search pooja or sponsor…"
                  emptyMessage="No pooja matches that search."
                  onChange={(value) =>
                    update('slotId', value === null ? null : Number(value))
                  }
                />
              </FormField>
            )}
          </div>

          {purpose === 'place' && (
            <PlacementFields draft={draft} bankAccounts={bankAccounts} onChange={update} />
          )}

          {purpose === 'renew' && (
            <FormField id="deposit-voucher-no" label="Manual Voucher No" required>
              <Input
                id="deposit-voucher-no"
                value={draft.manualVoucherNo}
                onChange={(changeEvent) => update('manualVoucherNo', changeEvent.target.value)}
              />
            </FormField>
          )}

          {matures && draft.principal > 0 && draft.interestRate > 0 && (
            <dl className="grid grid-cols-3 gap-x-4 rounded-lg bg-surface-2 px-3.5 py-3">
              <Projection label="Matures on" value={formatLongDate(matures)} />
              <Projection
                label="Interest"
                value={formatCurrency(interest)}
                tone="success"
              />
              <Projection
                label="Maturity value"
                value={formatCurrency(draft.principal + interest)}
                tone="primary"
              />
            </dl>
          )}

          <FormField id="deposit-notes" label="Notes">
            <Textarea
              id="deposit-notes"
              rows={2}
              value={draft.notes}
              placeholder="What this deposit is earmarked for"
              onChange={(changeEvent) =>
                update('notes', changeEvent.target.value)
              }
            />
          </FormField>

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

            <Button type="submit">
              {purpose === 'renew'
                ? 'Renew Deposit'
                : purpose === 'edit'
                  ? 'Save Changes'
                  : 'Place Deposit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PlacementFields({
  draft,
  bankAccounts,
  onChange,
}: {
  draft: DepositDraft;
  bankAccounts: readonly BankAccountRef[];
  onChange: <K extends keyof DepositDraft>(key: K, value: DepositDraft[K]) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="deposit-source" label="Money From" required>
          <Select
            value={draft.source}
            onValueChange={(value) => onChange('source', value as DepositDraft['source'])}
          >
            <SelectTrigger id="deposit-source" className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {(Object.keys(SOURCE_LABELS) as DepositDraft['source'][]).map((source) => (
                <SelectItem key={source} value={source}>
                  {SOURCE_LABELS[source]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {draft.source !== 'opening' && (
          <FormField id="deposit-voucher-no" label="Manual Voucher No" required>
            <Input
              id="deposit-voucher-no"
              value={draft.manualVoucherNo}
              onChange={(changeEvent) => onChange('manualVoucherNo', changeEvent.target.value)}
            />
          </FormField>
        )}
      </div>

      {draft.source === 'bank' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField id="deposit-mode" label="Mode" required>
            <Select
              value={draft.mode}
              onValueChange={(value) => onChange('mode', value as PaymentMode)}
            >
              <SelectTrigger id="deposit-mode" className="w-full">
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
            <FormField id="deposit-from-bank" label="From Account" required>
              <Select
                value={
                  draft.fromBankAccountId === null ? undefined : String(draft.fromBankAccountId)
                }
                onValueChange={(value) => onChange('fromBankAccountId', Number(value))}
              >
                <SelectTrigger id="deposit-from-bank" className="w-full">
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

          {draft.mode === 'cheque' && (
            <FormField id="deposit-cheque" label="Cheque No" required>
              <Input
                id="deposit-cheque"
                value={draft.chequeNo}
                onChange={(changeEvent) => onChange('chequeNo', changeEvent.target.value)}
              />
            </FormField>
          )}
        </div>
      )}
    </>
  );
}

function Projection({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'primary';
}) {
  const TONES = {
    default: 'text-text-primary',
    success: 'text-success',
    primary: 'text-primary',
  } as const;

  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-text-muted">{label}</dt>
      <dd
        className={`mt-0.5 truncate text-[13px] font-semibold tabular ${TONES[tone]}`}
      >
        {value}
      </dd>
    </div>
  );
}
