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
import type { EventType, FrequencyType } from '../types';

export interface EventTypeDraft {
  name: string;
  nameEn: string;
  frequencyType: FrequencyType;
  noOfInstances: number;
  /** Where receipts for this pooja are carried. Null offers nothing. */
  defaultFundId: number | null;
  defaultProjectId: number | null;
}

const NO_DEFAULT = '__none__';

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
      defaultFundId: eventType.defaultFundId,
      defaultProjectId: eventType.defaultProjectId,
    };
  }

  return {
    name: '',
    nameEn: '',
    frequencyType: 'multi_day',
    noOfInstances: DEFAULT_INSTANCE_COUNT.multi_day,
    defaultFundId: null,
    defaultProjectId: null,
  };
}

interface EventTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventType: EventType | null;
  /** Funds and projects a receipt for this pooja may be coded to. */
  funds: readonly { id: number; name: string }[];
  projects: readonly { id: number; name: string; fundId: number }[];
  onSubmit: (draft: EventTypeDraft) => void;
}

export function EventTypeFormDialog({
  open,
  onOpenChange,
  eventType,
  funds,
  projects,
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

  // A project is carried in exactly one fund, so only that fund's projects can
  // be offered — the API refuses a pair that points at two different funds.
  const fundProjects = projects.filter(
    (project) => project.fundId === draft.defaultFundId,
  );

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
            Event types are the permanent registry. The yearly calendar is
            built by instantiating them with dates.
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

          {/*
            * Answered once here so that raising a receipt for this pooja does
            * not ask for the same fund and project every time. A clerk can
            * still override either on the voucher itself.
            */}
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-2 p-3.5">
            <p className="text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
              Receipts for this pooja
            </p>

            <FormField
              id="type-fund"
              label="Fund"
              hint="Offered on every receipt raised for this pooja."
            >
              <Select
                value={
                  draft.defaultFundId === null
                    ? NO_DEFAULT
                    : String(draft.defaultFundId)
                }
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    defaultFundId: value === NO_DEFAULT ? null : Number(value),
                    // A project belongs to one fund, so it cannot survive a
                    // change of fund beneath it.
                    defaultProjectId: null,
                  }))
                }
              >
                <SelectTrigger id="type-fund" className="w-full">
                  <SelectValue placeholder="Ask each time" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={NO_DEFAULT}>Ask each time</SelectItem>

                  {funds.map((fund) => (
                    <SelectItem key={fund.id} value={String(fund.id)}>
                      {fund.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="type-project"
              label="Project"
              hint={
                draft.defaultFundId === null
                  ? 'Choose a fund first.'
                  : fundProjects.length === 0
                    ? 'This fund has no active projects.'
                    : undefined
              }
            >
              <Select
                value={
                  draft.defaultProjectId === null
                    ? NO_DEFAULT
                    : String(draft.defaultProjectId)
                }
                disabled={draft.defaultFundId === null || fundProjects.length === 0}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    defaultProjectId:
                      value === NO_DEFAULT ? null : Number(value),
                  }))
                }
              >
                <SelectTrigger id="type-project" className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={NO_DEFAULT}>None</SelectItem>

                  {fundProjects.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
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
