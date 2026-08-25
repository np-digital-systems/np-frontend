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

import {
  INTEREST_PAYOUTS,
  INTEREST_PAYOUT_LABELS,
  addMonthsIso,
  formatCurrency,
  formatLongDate,
  simpleInterest,
  yearsBetween,
} from '../lib/finance-data';
import { depositSchema } from '../lib/finance-schemas';
import type { DepositRecord, FundRecord, InterestPayout } from '../types';

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
  notes: string;
}

function draftFrom(
  deposit: DepositRecord | null,
  funds: readonly FundRecord[],
  today: string,
): DepositDraft {
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
      notes: deposit.notes ?? '',
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
    notes: '',
  };
}

export function maturityDate(placedOn: string, tenureMonths: number): string {
  return addMonthsIso(placedOn, tenureMonths);
}

interface DepositFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deposit: DepositRecord | null;
  funds: readonly FundRecord[];
  existing: readonly DepositRecord[];
  onSubmit: (draft: DepositDraft) => void;
}

export function DepositFormDialog({
  open,
  onOpenChange,
  deposit,
  funds,
  existing,
  onSubmit,
}: DepositFormDialogProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [draft, setDraft] = useState<DepositDraft>(() =>
    draftFrom(deposit, funds, today),
  );
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${deposit?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(deposit, funds, today));
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

    const result = validate(depositSchema, draft);

    if (!result.ok) {
      setError(result.message);
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

    setError(null);
    onSubmit(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {deposit ? `Edit ${deposit.certificateNo}` : 'Place Fixed Deposit'}
          </DialogTitle>
          <DialogDescription>
            A fixed deposit commits temple money for a term. Record it against
            the fund the money came from.
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
                step={10000}
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
                step={0.25}
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
              hint="The maturity date follows from this."
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
              {deposit ? 'Save Changes' : 'Place Deposit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
