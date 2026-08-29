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

interface FinancialYearFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { label: string; startsOn: string; endsOn: string }) => void;
}

/** The Sri Lankan financial year runs April to March. */
function defaultsFor(today = new Date()) {
  const year = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  const short = String((year + 1) % 100).padStart(2, '0');

  return {
    label: `${year}/${short}`,
    startsOn: `${year}-04-01`,
    endsOn: `${year + 1}-03-31`,
  };
}

export function FinancialYearFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: FinancialYearFormDialogProps) {
  const [draft, setDraft] = useState(() => defaultsFor());
  const [error, setError] = useState<string | null>(null);

  function update(key: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    // The same shape the API insists on, said before the round trip.
    if (!/^\d{4}(\/\d{2,4})?$/.test(draft.label.trim())) {
      setError('The label should look like 2026 or 2026/27.');
      return;
    }

    if (draft.endsOn <= draft.startsOn) {
      setError('The year has to end after it starts.');
      return;
    }

    setError(null);
    onSubmit({ ...draft, label: draft.label.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Financial Year</DialogTitle>
          <DialogDescription>
            A new year starts as upcoming. Open it when the books should begin
            accepting entries against it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField id="fy-label" label="Label" required hint="Such as 2026/27.">
            <Input
              id="fy-label"
              value={draft.label}
              onChange={(changeEvent) => update('label', changeEvent.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="fy-starts" label="Starts On" required>
              <Input
                id="fy-starts"
                type="date"
                value={draft.startsOn}
                onChange={(changeEvent) => update('startsOn', changeEvent.target.value)}
              />
            </FormField>

            <FormField id="fy-ends" label="Ends On" required>
              <Input
                id="fy-ends"
                type="date"
                value={draft.endsOn}
                onChange={(changeEvent) => update('endsOn', changeEvent.target.value)}
              />
            </FormField>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit">Create Year</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
