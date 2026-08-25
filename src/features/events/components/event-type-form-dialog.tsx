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

import {
  DEFAULT_INSTANCE_COUNT,
  FREQUENCY_LABELS,
  FREQUENCY_TYPES,
  INSTANCE_MEANING,
} from '../lib/event-data';
import type { EventType, FrequencyType } from '../types';


export interface EventTypeDraft {
  name: string;
  nameEn: string;
  frequencyType: FrequencyType;
  noOfInstances: number;
}

/** Frequencies whose instance count is fixed by definition, not by choice. */
const FIXED_INSTANCE_COUNT: readonly FrequencyType[] = [
  'annual',
  'monthly_once',
  'monthly_twice',
  'weekly',
];

function draftFrom(eventType: EventType | null): EventTypeDraft {
  if (eventType) {
    return {
      name: eventType.name,
      nameEn: eventType.nameEn,
      frequencyType: eventType.frequencyType,
      noOfInstances: eventType.noOfInstances,
    };
  }

  return {
    name: '',
    nameEn: '',
    frequencyType: 'multi_day',
    noOfInstances: DEFAULT_INSTANCE_COUNT.multi_day,
  };
}

interface EventTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventType: EventType | null;
  onSubmit: (draft: EventTypeDraft) => void;
}

/**
 * Create or edit an entry in the event-type registry.
 *
 * Changing the frequency rewrites the instance count to that frequency's
 * definition — a weekly type has 52 instances and an annual one has exactly
 * one, and leaving a stale number behind would make every downstream
 * instance label wrong.
 */
export function EventTypeFormDialog({
  open,
  onOpenChange,
  eventType,
  onSubmit,
}: EventTypeFormDialogProps) {
  const [draft, setDraft] = useState<EventTypeDraft>(() =>
    draftFrom(eventType),
  );
  const [error, setError] = useState<string | null>(null);

  // Re-seed when opened for a different record — see the note in
  // `event-form-dialog.tsx` on why this happens during render.
  const seed = `${open}|${eventType?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(eventType));
    setError(null);
  }

  const instancesFixed = FIXED_INSTANCE_COUNT.includes(draft.frequencyType);

  function handleFrequencyChange(frequencyType: FrequencyType) {
    setDraft((current) => ({
      ...current,
      frequencyType,
      noOfInstances: FIXED_INSTANCE_COUNT.includes(frequencyType)
        ? DEFAULT_INSTANCE_COUNT[frequencyType]
        : current.noOfInstances,
    }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!draft.name.trim()) {
      setError('A Tamil name is required — it is what appears on the calendar.');
      return;
    }

    if (draft.noOfInstances < 1) {
      setError('An event type must have at least one instance.');
      return;
    }

    setError(null);
    onSubmit({
      ...draft,
      name: draft.name.trim(),
      nameEn: draft.nameEn.trim(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {eventType ? 'Edit Event Type' : 'New Event Type'}
          </DialogTitle>
          <DialogDescription>
            Event types are the permanent registry. The yearly calendar is
            built by instantiating them with dates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField id="type-name" label="Name (Tamil)" required>
            <Input
              id="type-name"
              value={draft.name}
              placeholder="ஆண்டு மகா திருவிழா"
              onChange={(changeEvent) =>
                setDraft((current) => ({
                  ...current,
                  name: changeEvent.target.value,
                }))
              }
            />
          </FormField>

          <FormField
            id="type-name-en"
            label="Name (English)"
            hint="Shown as a secondary line for non-Tamil readers."
          >
            <Input
              id="type-name-en"
              value={draft.nameEn}
              placeholder="Annual Grand Festival"
              onChange={(changeEvent) =>
                setDraft((current) => ({
                  ...current,
                  nameEn: changeEvent.target.value,
                }))
              }
            />
          </FormField>

          <FormField
            id="frequency"
            label="Frequency"
            required
            hint={INSTANCE_MEANING[draft.frequencyType]}
          >
            <Select
              value={draft.frequencyType}
              onValueChange={(value) =>
                handleFrequencyChange(value as FrequencyType)
              }
            >
              <SelectTrigger id="frequency" className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {FREQUENCY_TYPES.map((frequency) => (
                  <SelectItem key={frequency} value={frequency}>
                    {FREQUENCY_LABELS[frequency]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            id="no-of-instances"
            label="Instances per year"
            required
            hint={
              instancesFixed
                ? 'Fixed by the selected frequency.'
                : 'How many days the festival runs.'
            }
          >
            <Input
              id="no-of-instances"
              type="number"
              min={1}
              max={366}
              disabled={instancesFixed}
              value={draft.noOfInstances}
              onChange={(changeEvent) =>
                setDraft((current) => ({
                  ...current,
                  noOfInstances: Number(changeEvent.target.value) || 1,
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

            <Button type="submit">
              {eventType ? 'Save Changes' : 'Create Event Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
