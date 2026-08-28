'use client';

import { useMemo, useState } from 'react';

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
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { INSTANCE_MEANING, describeInstance } from '../lib/event-data';
import { eventSchema } from '../lib/event-schemas';
import {
  UNASSIGNED,
  eventTypeGroups,
  instanceCountOf,
  instanceGroups,
  sponsorGroups,
} from '../lib/sponsor-options';
import type {
  EventRecord,
  EventType,
  SponsorAssignment,
  SponsorUser,
} from '../types';

export interface EventDraft {
  eventTypeId: number;
  instanceIdentifier: number;
  customInstanceName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  sponsorId: string | null;
  notes: string;
  isCompleted: boolean;
}


function draftFrom(
  event: EventRecord | null,
  eventTypes: readonly EventType[],
): EventDraft {
  if (event) {
    return {
      eventTypeId: event.eventTypeId,
      instanceIdentifier: event.instanceIdentifier,
      customInstanceName: event.customInstanceName ?? '',
      scheduledDate: event.scheduledDate,
      startTime: event.startTime,
      endTime: event.endTime ?? '',
      sponsorId: event.sponsorId,
      notes: event.notes ?? '',
      isCompleted: event.isCompleted,
    };
  }

  return {
    eventTypeId: eventTypes[0]?.id ?? 0,
    instanceIdentifier: 1,
    customInstanceName: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
    sponsorId: null,
    notes: '',
    isCompleted: false,
  };
}

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
    event: EventRecord | null;
    mode?: 'create' | 'edit';
  eventTypes: readonly EventType[];
  sponsors: readonly SponsorUser[];
  /** Standing registrations, used to put this slot's sponsors on top. */
  assignments: readonly SponsorAssignment[];
  canComplete: boolean;
  onSubmit: (draft: EventDraft) => void;
}

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  mode = event ? 'edit' : 'create',
  eventTypes,
  sponsors,
  assignments,
  canComplete,
  onSubmit,
}: EventFormDialogProps) {
  const isEdit = mode === 'edit';
  const [draft, setDraft] = useState<EventDraft>(() =>
    draftFrom(event, eventTypes),
  );
  const [error, setError] = useState<string | null>(null);

    const seed = [
    open,
    event?.id ?? 'new',
    event?.eventTypeId ?? '',
    event?.instanceIdentifier ?? '',
  ].join('|');

  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(event, eventTypes));
    setError(null);
  }

  const selectedType = useMemo(
    () => eventTypes.find((type) => type.id === draft.eventTypeId) ?? null,
    [eventTypes, draft.eventTypeId],
  );

  const maxInstance = instanceCountOf(selectedType);

  const instancePreview = selectedType
    ? describeInstance(
        selectedType.frequencyType,
        draft.instanceIdentifier,
        draft.customInstanceName || null,
      )
    : '';

  function update<K extends keyof EventDraft>(key: K, value: EventDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  const sponsorChoices = useMemo(() => {
    const groups = sponsorGroups(
      assignments,
      draft.eventTypeId,
      draft.instanceIdentifier,
      {
        lead: {
          value: UNASSIGNED,
          label: 'Unassigned',
          description: 'Nobody has taken this occurrence yet',
        },
        directory: sponsors,
      },
    );

    // Somebody who has since left the directory — deactivated, say — would
    // otherwise vanish from the list and be dropped on the next save.
    const current = event?.sponsor;

    const listed =
      !current ||
      groups.some((group) =>
        group.options.some((option) => option.value === current.id),
      );

    return listed
      ? groups
      : [
          ...groups,
          {
            heading: 'Current sponsor',
            options: [
              {
                value: current.id,
                label: current.fullName,
                description: 'No longer in the directory',
              },
            ],
          },
        ];
  }, [
    assignments,
    sponsors,
    event?.sponsor,
    draft.eventTypeId,
    draft.instanceIdentifier,
  ]);

  /**
   * The sponsor a slot falls to when it has exactly one registered.
   *
   * Anything less certain is left for the user to pick: with several sponsors
   * on a slot, choosing one for them would be a guess, and the list already
   * puts all of them at the top.
   */
  function soleSponsorOf(eventTypeId: number, instance: number): string | null {
    const registered = assignments.filter(
      (assignment) =>
        assignment.eventTypeId === eventTypeId &&
        assignment.instanceIdentifier === instance,
    );

    return registered.length === 1 ? registered[0].userId : null;
  }

  /** Retargeting the draft, filling the sponsor in only while it is empty. */
  function retarget(eventTypeId: number, instance: number) {
    setDraft((current) => ({
      ...current,
      eventTypeId,
      instanceIdentifier: instance,
      sponsorId: current.sponsorId ?? soleSponsorOf(eventTypeId, instance),
    }));
  }

  function selectEventType(eventTypeId: number) {
    const nextType = eventTypes.find((type) => type.id === eventTypeId) ?? null;
    const limit = instanceCountOf(nextType);

    retarget(eventTypeId, Math.min(draft.instanceIdentifier, limit));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(eventSchema, draft);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (result.data.instanceIdentifier > maxInstance) {
      setError(
        `Instance must be between 1 and ${maxInstance} for this event type.`,
      );
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
          <DialogTitle>{isEdit ? 'Edit Event' : 'New Event'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the scheduled occurrence, its timing or its sponsor.'
              : 'Add a dated occurrence of an event type to this year’s calendar.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField id="event-type" label="Event Type" required>
            <Combobox
              id="event-type"
              value={draft.eventTypeId ? String(draft.eventTypeId) : null}
              groups={eventTypeGroups(eventTypes)}
              placeholder="Select an event type"
              searchPlaceholder="Search event types…"
              emptyMessage="No event type matches that search."
              onChange={(value) => selectEventType(Number(value))}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="instance-identifier"
              label="Instance"
              required
              hint={
                selectedType
                  ? INSTANCE_MEANING[selectedType.frequencyType]
                  : undefined
              }
            >
              <Combobox
                id="instance-identifier"
                value={String(draft.instanceIdentifier)}
                groups={instanceGroups(selectedType)}
                placeholder="Select an instance"
                searchPlaceholder="Search instances…"
                emptyMessage="No instance matches that search."
                onChange={(value) =>
                  retarget(draft.eventTypeId, Number(value))
                }
              />
            </FormField>

            <FormField
              id="custom-instance-name"
              label="Custom Instance Name"
              hint="The temple's own name for this day, if it has one."
            >
              <Input
                id="custom-instance-name"
                value={draft.customInstanceName}
                placeholder="சப்பரம், தேர்…"
                onChange={(changeEvent) =>
                  update('customInstanceName', changeEvent.target.value)
                }
              />
            </FormField>
          </div>

          {selectedType && (
            <p className="-mt-1 rounded-lg bg-surface-2 px-3 py-2 text-xs text-text-secondary">
              Will appear as{' '}
              <span className="font-medium text-text-primary">
                {selectedType.name} — {instancePreview}
              </span>
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField id="scheduled-date" label="Date" required>
              <Input
                id="scheduled-date"
                type="date"
                value={draft.scheduledDate}
                onChange={(changeEvent) =>
                  update('scheduledDate', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField id="start-time" label="Start" required>
              <Input
                id="start-time"
                type="time"
                value={draft.startTime}
                onChange={(changeEvent) =>
                  update('startTime', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField id="end-time" label="End">
              <Input
                id="end-time"
                type="time"
                value={draft.endTime}
                onChange={(changeEvent) =>
                  update('endTime', changeEvent.target.value)
                }
              />
            </FormField>
          </div>

          <FormField
            id="sponsor"
            label="Sponsor"
            hint="The sponsors registered for this instance come first, then the rest of this event type's."
          >
            <Combobox
              id="sponsor"
              value={draft.sponsorId ?? UNASSIGNED}
              groups={sponsorChoices}
              searchPlaceholder="Search by name or address…"
              emptyMessage="Nobody matches that search."
              onChange={(value) =>
                update('sponsorId', value === UNASSIGNED ? null : value)
              }
            />
          </FormField>

          <FormField id="notes" label="Notes">
            <Textarea
              id="notes"
              rows={3}
              value={draft.notes}
              placeholder="Manual adjustments, swap logs, timing changes…"
              onChange={(changeEvent) =>
                update('notes', changeEvent.target.value)
              }
            />
          </FormField>

          {canComplete && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
              <div className="min-w-0 pr-4">
                <Label
                  htmlFor="is-completed"
                  className="text-xs font-medium text-text-secondary"
                >
                  Mark as completed
                </Label>
                <p className="mt-0.5 text-[11px] text-text-muted">
                  Completed events stay on the calendar as a record.
                </p>
              </div>

              <Switch
                id="is-completed"
                checked={draft.isCompleted}
                onCheckedChange={(checked) => update('isCompleted', checked)}
              />
            </div>
          )}

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
              {isEdit ? 'Save Changes' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
