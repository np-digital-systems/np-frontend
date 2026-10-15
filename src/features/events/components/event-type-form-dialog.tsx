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

import {
  DEFAULT_INSTANCE_COUNT,
  FREQUENCY_LABELS,
  FREQUENCY_TYPES,
  INSTANCE_MEANING,
} from '../lib/event-data';
import { eventTypeSchema } from '../lib/event-schemas';
import type { EventFunding, EventType, FrequencyType } from '../types';

export interface EventTypeDraft {
  name: string;
  nameEn: string;
  frequencyType: FrequencyType;
  funding: EventFunding;
  noOfInstances: number;
  activityId: number | null;
}

const NO_DEFAULT = '__none__';

// monthly_once is excluded: a Tamil year has 12 or 13 months, so the temple sets the count.
const FIXED_INSTANCE_COUNT: readonly FrequencyType[] = [
  'annual',
  'monthly_twice',
  'weekly',
];

const INSTANCE_HINT: Partial<Record<FrequencyType, string>> = {
  multi_day: 'How many days the festival runs.',
  monthly_once: 'Months in the year — 13 when the Tamil calendar adds one.',
};

function draftFrom(eventType: EventType | null): EventTypeDraft {
  if (eventType) {
    return {
      name: eventType.name,
      nameEn: eventType.nameEn,
      frequencyType: eventType.frequencyType,
      funding: eventType.funding,
      noOfInstances: eventType.noOfInstances,
      activityId: eventType.activityId,
    };
  }

  return {
    name: '',
    nameEn: '',
    frequencyType: 'multi_day',
    funding: 'sponsored',
    noOfInstances: DEFAULT_INSTANCE_COUNT.multi_day,
    activityId: null,
  };
}

interface EventTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventType: EventType | null;
  activities: readonly { id: number; name: string; nameEn: string }[];
  onSubmit: (draft: EventTypeDraft) => void;
}

export function EventTypeFormDialog({
  open,
  onOpenChange,
  eventType,
  activities,
  onSubmit,
}: EventTypeFormDialogProps) {
  const [draft, setDraft] = useState<EventTypeDraft>(() =>
    draftFrom(eventType),
  );
  const [error, setError] = useState<string | null>(null);

  // Reset the draft when opened for a different record.
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

    const result = validate(eventTypeSchema, draft);

    if (!result.ok) {
      setError(result.message);
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
          <DialogTitle>
            {eventType ? 'Edit Event Type' : 'New Event Type'}
          </DialogTitle>
          <DialogDescription>
            A recurring pooja or festival.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField id="type-name" label="Name (Tamil)" required>
            <Input
              id="type-name"
              value={draft.name}
              placeholder="திருவிழா"
              onChange={(changeEvent) =>
                setDraft((current) => ({
                  ...current,
                  name: changeEvent.target.value,
                }))
              }
            />
          </FormField>

          <FormField
            id="type-funding"
            label="Funded by"
            required
            hint={
              draft.funding === 'general'
                ? 'Funded by collection. No sponsors.'
                : 'One sponsor per slot each year.'
            }
          >
            <div
              id="type-funding"
              role="group"
              aria-label="Funded by"
              className="grid grid-cols-2 gap-2"
            >
              {(
                [
                  ['sponsored', 'Named sponsors'],
                  ['general', 'General collection'],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  htmlFor={`type-funding-${value}`}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-input has-[:checked]:border-accent has-[:checked]:text-text-primary"
                >
                  <input
                    id={`type-funding-${value}`}
                    type="radio"
                    name="type-funding"
                    className="size-3.5 accent-[var(--accent)]"
                    checked={draft.funding === value}
                    onChange={() =>
                      setDraft((current) => ({ ...current, funding: value }))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </FormField>

          <FormField
            id="type-name-en"
            label="Name (English)"
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
                : INSTANCE_HINT[draft.frequencyType]
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

          <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-2 p-3.5">
            <p className="text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
              Receipts for this pooja
            </p>

            <FormField
              id="type-activity"
              label="Activity"
              hint={
                activities.length === 0
                  ? 'No activities yet. Add one under Accounting.'
                  : undefined
              }
            >
              <Select
                value={
                  draft.activityId === null ? NO_DEFAULT : String(draft.activityId)
                }
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    activityId: value === NO_DEFAULT ? null : Number(value),
                  }))
                }
              >
                <SelectTrigger id="type-activity" className="w-full">
                  <SelectValue placeholder="Ask each time" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={NO_DEFAULT}>Ask each time</SelectItem>

                  {activities.map((activity) => (
                    <SelectItem key={activity.id} value={String(activity.id)}>
                      {activity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
