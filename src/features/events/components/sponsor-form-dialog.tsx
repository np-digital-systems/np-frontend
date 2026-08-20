'use client';

import { useMemo, useState } from 'react';

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
  INSTANCE_MEANING,
  describeInstance,
} from '../lib/event-data';
import type { EventType, SponsorAssignment, SponsorUser } from '../types';

import { FormField } from './form-field';

/** The writable columns of `event_type_sponsors`. */
export interface SponsorDraft {
  eventTypeId: number;
  instanceIdentifier: number;
  customInstanceName: string;
  userId: string;
}

function draftFrom(
  assignment: SponsorAssignment | null,
  eventTypes: readonly EventType[],
  sponsors: readonly SponsorUser[],
): SponsorDraft {
  if (assignment) {
    return {
      eventTypeId: assignment.eventTypeId,
      instanceIdentifier: assignment.instanceIdentifier,
      customInstanceName: assignment.customInstanceName ?? '',
      userId: assignment.userId,
    };
  }

  return {
    eventTypeId: eventTypes[0]?.id ?? 0,
    instanceIdentifier: 1,
    customInstanceName: '',
    userId: sponsors[0]?.id ?? '',
  };
}

interface SponsorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: SponsorAssignment | null;
  eventTypes: readonly EventType[];
  sponsors: readonly SponsorUser[];
  /** Existing slots, so a second sponsor cannot be added to one slot. */
  taken: readonly { eventTypeId: number; instanceIdentifier: number; id: number }[];
  onSubmit: (draft: SponsorDraft) => void;
}

/**
 * Assign a devotee to a recurring instance.
 *
 * This writes a *standing* assignment, not a dated event: "the family that
 * sponsors the tenth festival day every year". The unique constraint on
 * (event_type_id, instance_identifier) is enforced here too, so the clash
 * is caught before a round trip rather than as a database error.
 */
export function SponsorFormDialog({
  open,
  onOpenChange,
  assignment,
  eventTypes,
  sponsors,
  taken,
  onSubmit,
}: SponsorFormDialogProps) {
  const [draft, setDraft] = useState<SponsorDraft>(() =>
    draftFrom(assignment, eventTypes, sponsors),
  );
  const [error, setError] = useState<string | null>(null);

  // Re-seed when opened for a different record — see the note in
  // `event-form-dialog.tsx` on why this happens during render.
  const seed = `${open}|${assignment?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(assignment, eventTypes, sponsors));
    setError(null);
  }

  const selectedType = useMemo(
    () => eventTypes.find((type) => type.id === draft.eventTypeId) ?? null,
    [eventTypes, draft.eventTypeId],
  );

  const maxInstance = selectedType
    ? Math.max(
        selectedType.noOfInstances,
        DEFAULT_INSTANCE_COUNT[selectedType.frequencyType],
      )
    : 1;

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!draft.userId) {
      setError('Choose the devotee or trust sponsoring this instance.');
      return;
    }

    if (draft.instanceIdentifier < 1 || draft.instanceIdentifier > maxInstance) {
      setError(`Instance must be between 1 and ${maxInstance} for this event type.`);
      return;
    }

    const clash = taken.find(
      (slot) =>
        slot.eventTypeId === draft.eventTypeId &&
        slot.instanceIdentifier === draft.instanceIdentifier &&
        slot.id !== assignment?.id,
    );

    if (clash) {
      setError(
        'That instance already has a standing sponsor. Edit the existing assignment instead.',
      );
      return;
    }

    setError(null);
    onSubmit({
      ...draft,
      customInstanceName: draft.customInstanceName.trim(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {assignment ? 'Edit Sponsor Assignment' : 'Assign Sponsor'}
          </DialogTitle>
          <DialogDescription>
            A standing assignment applies to this instance every year, and is
            offered as the default sponsor when the instance is scheduled.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField id="sponsor-event-type" label="Event Type" required>
            <Select
              value={String(draft.eventTypeId)}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  eventTypeId: Number(value),
                }))
              }
            >
              <SelectTrigger id="sponsor-event-type" className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name} · {type.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="sponsor-instance"
              label="Instance"
              required
              hint={
                selectedType
                  ? INSTANCE_MEANING[selectedType.frequencyType]
                  : undefined
              }
            >
              <Input
                id="sponsor-instance"
                type="number"
                min={1}
                max={maxInstance}
                value={draft.instanceIdentifier}
                onChange={(changeEvent) =>
                  setDraft((current) => ({
                    ...current,
                    instanceIdentifier: Number(changeEvent.target.value) || 1,
                  }))
                }
              />
            </FormField>

            <FormField
              id="sponsor-instance-name"
              label="Custom Instance Name"
              hint="The traditional name of this slot, if it has one."
            >
              <Input
                id="sponsor-instance-name"
                value={draft.customInstanceName}
                placeholder="ஆபரணம், தேர்…"
                onChange={(changeEvent) =>
                  setDraft((current) => ({
                    ...current,
                    customInstanceName: changeEvent.target.value,
                  }))
                }
              />
            </FormField>
          </div>

          {selectedType && (
            <p className="-mt-1 rounded-lg bg-surface-2 px-3 py-2 text-xs text-text-secondary">
              Sponsoring{' '}
              <span className="font-medium text-text-primary">
                {selectedType.name} —{' '}
                {describeInstance(
                  selectedType.frequencyType,
                  draft.instanceIdentifier,
                  draft.customInstanceName || null,
                )}
              </span>
            </p>
          )}

          <FormField id="sponsor-user" label="Sponsor" required>
            <Select
              value={draft.userId}
              onValueChange={(value) =>
                setDraft((current) => ({ ...current, userId: value }))
              }
            >
              <SelectTrigger id="sponsor-user" className="w-full">
                <SelectValue placeholder="Select a devotee" />
              </SelectTrigger>

              <SelectContent>
                {sponsors.map((sponsor) => (
                  <SelectItem key={sponsor.id} value={sponsor.id}>
                    {sponsor.fullName}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit">
              {assignment ? 'Save Changes' : 'Assign Sponsor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
