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
import { Textarea } from '@/components/ui/textarea';

import { formatCurrency } from '../lib/finance-data';
import { disposalSchema } from '../lib/finance-schemas';
import type { AssetRecord } from '../types';

export interface DisposalDraft {
  disposedOn: string;
  disposalValue: number;
  notes: string;
}

interface DisposeAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: AssetRecord | null;
  today: string;
  onConfirm: (draft: DisposalDraft) => void;
}

export function DisposeAssetDialog({
  open,
  onOpenChange,
  asset,
  today,
  onConfirm,
}: DisposeAssetDialogProps) {
  const [draft, setDraft] = useState<DisposalDraft>({
    disposedOn: today,
    disposalValue: 0,
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${asset?.id ?? 'none'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft({ disposedOn: today, disposalValue: 0, notes: '' });
    setError(null);
  }

  const bookValue = asset?.netBookValue ?? 0;
  const result = draft.disposalValue - bookValue;

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(disposalSchema, draft);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (asset && result.data.disposedOn < asset.acquiredOn) {
      setError('An asset cannot be disposed of before it was acquired.');
      return;
    }

    if (result.data.disposedOn > today) {
      setError('A disposal cannot be recorded in the future.');
      return;
    }

    setError(null);
    onConfirm(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {asset && (
          <>
            <DialogHeader>
              <DialogTitle>Dispose of {asset.tag}</DialogTitle>
              <DialogDescription>
                {asset.name} leaves the temple’s register. The record is kept
                for the audit trail and stops depreciating on this date.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <dl className="grid grid-cols-2 gap-x-4 rounded-lg bg-surface-2 px-3.5 py-3">
                <div>
                  <dt className="text-[11px] text-text-muted">Cost</dt>
                  <dd className="mt-0.5 text-[13px] font-semibold text-text-primary tabular">
                    {formatCurrency(asset.cost)}
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] text-text-muted">
                    Book value today
                  </dt>
                  <dd className="mt-0.5 text-[13px] font-semibold text-text-primary tabular">
                    {formatCurrency(bookValue)}
                  </dd>
                </div>
              </dl>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField id="disposal-date" label="Disposed On" required>
                  <Input
                    id="disposal-date"
                    type="date"
                    max={today}
                    value={draft.disposedOn}
                    onChange={(changeEvent) =>
                      setDraft((current) => ({
                        ...current,
                        disposedOn: changeEvent.target.value,
                      }))
                    }
                  />
                </FormField>

                <FormField
                  id="disposal-value"
                  label="Amount Received"
                  hint="Zero if it was scrapped or given away."
                >
                  <Input
                    id="disposal-value"
                    type="number"
                    min={0}
                    step={500}
                    value={draft.disposalValue || ''}
                    onChange={(changeEvent) =>
                      setDraft((current) => ({
                        ...current,
                        disposalValue: Number(changeEvent.target.value) || 0,
                      }))
                    }
                  />
                </FormField>
              </div>

              {bookValue > 0 || draft.disposalValue > 0 ? (
                <p
                  className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    result >= 0
                      ? 'bg-success-subtle text-success'
                      : 'bg-warning-subtle text-warning'
                  }`}
                >
                  {result >= 0 ? 'Gain' : 'Loss'} on disposal of{' '}
                  <span className="font-semibold tabular">
                    {formatCurrency(Math.abs(result))}
                  </span>{' '}
                  against a book value of {formatCurrency(bookValue)}. Raise a
                  receipt voucher separately for any money received.
                </p>
              ) : null}

              <FormField id="disposal-notes" label="What happened to it" required>
                <Textarea
                  id="disposal-notes"
                  rows={3}
                  value={draft.notes}
                  placeholder="Sold as scrap, donated to another temple, destroyed…"
                  onChange={(changeEvent) =>
                    setDraft((current) => ({
                      ...current,
                      notes: changeEvent.target.value,
                    }))
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

                <Button type="submit" variant="destructive">
                  Record Disposal
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
