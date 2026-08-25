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
import { Switch } from '@/components/ui/switch';

import { formatCurrency } from '../lib/finance-data';
import { fundSchema } from '../lib/finance-schemas';
import type { FundRecord } from '../types';

export interface FundDraft {
  name: string;
  nameTa: string;
  opening: number;
  isActive: boolean;
}

function draftFrom(fund: FundRecord | null): FundDraft {
  if (fund) {
    return {
      name: fund.name,
      nameTa: fund.nameTa,
      opening: fund.opening,
      isActive: fund.isActive,
    };
  }

  return { name: '', nameTa: '', opening: 0, isActive: true };
}

interface FundFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fund: FundRecord | null;
  existing: readonly FundRecord[];
  onSubmit: (draft: FundDraft) => void;
}

export function FundFormDialog({
  open,
  onOpenChange,
  fund,
  existing,
  onSubmit,
}: FundFormDialogProps) {
  const [draft, setDraft] = useState<FundDraft>(() => draftFrom(fund));
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${fund?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(fund));
    setError(null);
  }

  const openingChanged = fund !== null && draft.opening !== fund.opening;
  const hasHistory = (fund?.entryCount ?? 0) > 0;

  function update<K extends keyof FundDraft>(key: K, value: FundDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(fundSchema, draft);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    const clash = existing.some(
      (entry) =>
        entry.name.toLowerCase() === result.data.name.toLowerCase() &&
        entry.id !== fund?.id,
    );

    if (clash) {
      setError(`A fund called “${result.data.name}” already exists.`);
      return;
    }

    setError(null);
    onSubmit(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{fund ? `Edit ${fund.name}` : 'New Fund'}</DialogTitle>
          <DialogDescription>
            A fund is an earmarked pool of the temple’s money. Every receipt
            and payment is charged to exactly one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField id="fund-name" label="Name (English)" required>
            <Input
              id="fund-name"
              value={draft.name}
              placeholder="Thiruppani Fund"
              onChange={(changeEvent) =>
                update('name', changeEvent.target.value)
              }
            />
          </FormField>

          <FormField
            id="fund-name-ta"
            label="Name (Tamil)"
            hint="Shown on Tamil statements and the printed fund summary."
          >
            <Input
              id="fund-name-ta"
              value={draft.nameTa}
              placeholder="திருப்பணி நிதி"
              onChange={(changeEvent) =>
                update('nameTa', changeEvent.target.value)
              }
            />
          </FormField>

          <FormField
            id="fund-opening"
            label="Opening Balance"
            hint="What the fund carried in from the previous year."
          >
            <Input
              id="fund-opening"
              type="number"
              min={0}
              step={1000}
              value={draft.opening || ''}
              onChange={(changeEvent) =>
                update('opening', Number(changeEvent.target.value) || 0)
              }
            />
          </FormField>

          {openingChanged && hasHistory && (
            <p className="rounded-lg bg-warning-subtle px-3 py-2 text-xs leading-relaxed text-warning">
              This fund already has {fund?.entryCount} posted{' '}
              {fund?.entryCount === 1 ? 'entry' : 'entries'}. Changing the
              opening balance from {formatCurrency(fund?.opening ?? 0)} to{' '}
              {formatCurrency(draft.opening)} moves its closing balance by the
              same amount and will not reconcile against last year’s accounts.
            </p>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="min-w-0 pr-4">
              <Label
                htmlFor="fund-active"
                className="text-xs font-medium text-text-secondary"
              >
                Active
              </Label>
              <p className="mt-0.5 text-[11px] text-text-muted">
                An inactive fund keeps its history but accepts no new entries.
              </p>
            </div>

            <Switch
              id="fund-active"
              checked={draft.isActive}
              onCheckedChange={(checked) => update('isActive', checked)}
            />
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

            <Button type="submit">
              {fund ? 'Save Changes' : 'Create Fund'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
