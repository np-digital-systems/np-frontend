'use client';

import { useState, useTransition } from 'react';

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

import { setSanththaRate } from '../lib/rate-actions';
import { formatCurrency } from '../lib/contributions-data';

interface SetRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  current: number | null;
  /** How many sponsors owe it, so the year's expected total is visible. */
  subscribing: number;
  onSaved: () => void;
}

/** Sets the one amount every sponsor owes for a year. */
export function SetRateDialog({
  open,
  onOpenChange,
  year,
  current,
  subscribing,
  onSaved,
}: SetRateDialogProps) {
  const [amount, setAmount] = useState(current === null ? '' : String(current));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const seed = `${open}|${year}|${current ?? ''}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setAmount(current === null ? '' : String(current));
    setError(null);
  }

  const parsed = Number(amount);
  const valid = Number.isFinite(parsed) && parsed > 0;

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!valid) {
      setError('Enter an amount greater than zero.');
      return;
    }

    startTransition(async () => {
      const result = await setSanththaRate(year, parsed);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setError(null);
      onOpenChange(false);
      onSaved();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sanththa for {year}</DialogTitle>
          <DialogDescription>
            One amount for every sponsor. Payments already taken keep the amount they were
            taken at, so this only changes what the form offers from now on.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            id="rate-amount"
            label={`Amount per sponsor (${year})`}
            required
            hint={
              valid
                ? `${subscribing} subscribing sponsor(s) — ${formatCurrency(parsed * subscribing)} for the year.`
                : 'The figure the payment form will open on.'
            }
          >
            <Input
              id="rate-amount"
              inputMode="decimal"
              placeholder="1000.00"
              value={amount}
              onChange={(changeEvent) => setAmount(changeEvent.target.value)}
            />
          </FormField>

          {error && (
            <p role="alert" className="rounded-lg bg-danger-subtle px-3 py-2 text-xs text-danger">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !valid}>
              {pending ? 'Saving…' : current === null ? 'Set the sanththa' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
