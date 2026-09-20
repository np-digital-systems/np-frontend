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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { validate } from '@/lib/validation';

import { loadEventSlots } from '../lib/event-actions';
import { costingSchema } from '../lib/costing-schemas';
import type { EventSlot, EventTypeRecord } from '../types';

export interface CostingHeaderDraft {
  eventTypeId: number;
  slotId: number | null;
}

const EVERY_INSTANCE = '__every__';

interface CostingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTypes: readonly EventTypeRecord[];
  onSubmit: (draft: CostingHeaderDraft) => void;
}

/**
 * Opening a costing: whose it is, and which instances it covers.
 *
 * Two questions, because two is all there is to ask. The income head and the
 * fund come from the pooja type's activity, the date is today, the quote is the
 * lines added up, and the lines are written on the editor this opens into. An
 * earlier version of this dialog asked for all of that — including one expense
 * line whose five siblings were written somewhere else, which is no way to fill
 * in a form.
 */
export function CostingFormDialog({
  open,
  onOpenChange,
  eventTypes,
  onSubmit,
}: CostingFormDialogProps) {
  const [draft, setDraft] = useState<CostingHeaderDraft>({ eventTypeId: 0, slotId: null });
  const [slots, setSlots] = useState<readonly EventSlot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [wasOpen, setWasOpen] = useState(open);

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setDraft({ eventTypeId: 0, slotId: null });
      setSlots([]);
      setError(null);
    }
  }

  async function handleTypeChange(value: string) {
    const eventTypeId = Number(value);

    setDraft({ eventTypeId, slotId: null });
    setSlots(await loadEventSlots(eventTypeId));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(costingSchema, { ...draft, notes: '' });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError(null);
    onSubmit(draft);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Costing</DialogTitle>
          <DialogDescription>
            Write one for a whole pooja type, or for a single instance where the
            money is genuinely different. The lines come next.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField id="costing-type" label="Pooja type" required>
            <Select
              value={draft.eventTypeId ? String(draft.eventTypeId) : undefined}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger id="costing-type" className="w-full">
                <SelectValue placeholder="Choose a pooja type" />
              </SelectTrigger>

              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            id="costing-slot"
            label="Covers"
            required
            hint={
              draft.slotId === null
                ? 'Every instance that has no costing of its own.'
                : 'Only this instance. It beats the type-wide costing on its own dates.'
            }
          >
            <Select
              value={draft.slotId === null ? EVERY_INSTANCE : String(draft.slotId)}
              disabled={draft.eventTypeId === 0}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  slotId: value === EVERY_INSTANCE ? null : Number(value),
                }))
              }
            >
              <SelectTrigger id="costing-slot" className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={EVERY_INSTANCE}>Every instance</SelectItem>

                {slots.map((slot) => (
                  <SelectItem key={slot.id} value={String(slot.id)}>
                    {slot.instanceLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
