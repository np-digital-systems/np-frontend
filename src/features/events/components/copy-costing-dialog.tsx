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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { loadEventSlots } from '../lib/event-actions';
import { describeScope } from '../lib/costing-data';
import type { EventSlot } from '../types';
import type { CostingRecord } from '../types/costing';

const EVERY_INSTANCE = '__every__';

interface CopyCostingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  costing: CostingRecord | null;
  onSubmit: (input: { slotId: number | null; effectiveFrom: string }) => void;
}

/**
 * Day two of a festival is day one with three figures changed.
 *
 * The copy lands as a draft carrying every line and its itemisation, so the
 * work left is correcting what differs rather than retyping what does not.
 * The same button starts next year's revision: copy the version in force,
 * change the figures, and put the copy into force from the new date.
 */
export function CopyCostingDialog({
  open,
  onOpenChange,
  costing,
  onSubmit,
}: CopyCostingDialogProps) {
  const [slotId, setSlotId] = useState<number | null>(null);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [slots, setSlots] = useState<readonly EventSlot[]>([]);

  const seed = `${open}|${costing?.id ?? 'none'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setSlotId(costing?.slotId ?? null);
    setEffectiveFrom(costing?.effectiveFrom ?? '');
    setSlots([]);

    if (open && costing) {
      void loadEventSlots(costing.eventTypeId).then(setSlots);
    }
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    onSubmit({ slotId, effectiveFrom });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy this costing</DialogTitle>
          <DialogDescription>
            {costing
              ? `Every line of ${describeScope(costing)}, and the items under each, copied into a new draft.`
              : ''}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            id="copy-slot"
            label="Copy onto"
            required
            hint={
              slotId === null
                ? 'Every instance that has no costing of its own.'
                : 'Only this instance.'
            }
          >
            <Select
              value={slotId === null ? EVERY_INSTANCE : String(slotId)}
              onValueChange={(value) =>
                setSlotId(value === EVERY_INSTANCE ? null : Number(value))
              }
            >
              <SelectTrigger id="copy-slot" className="w-full">
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

          <FormField
            id="copy-from"
            label="In force from"
            required
            hint="Replacing the version in force means starting after the date it started."
          >
            <Input
              id="copy-from"
              type="date"
              value={effectiveFrom}
              onChange={(changeEvent) => setEffectiveFrom(changeEvent.target.value)}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit">Create Copy</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
