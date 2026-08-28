'use client';

import { useMemo, useState } from 'react';

import { FormField, SegmentedControl } from '@/components/portal/ui';
import { validate } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { describeInstance } from '../lib/event-data';
import { newSponsorSchema, sponsorPlacementSchema } from '../lib/event-schemas';
import {
  ANY_INSTANCE,
  eventTypeGroups,
  instanceCountOf,
  instanceGroups,
  sponsorGroups,
} from '../lib/sponsor-options';
import type { EventType, SponsorAssignment, SponsorUser } from '../types';

/** Whether the person is being typed in or picked out of the directory. */
type Source = 'New person' | 'From directory';

const SOURCES: readonly Source[] = ['New person', 'From directory'];

export interface SponsorDraft {
  eventTypeId: number;
  instanceIdentifier: number | null;
  customInstanceName: string;
  /** Set when the sponsor is somebody already in the directory. */
  userId: string;
  /** Set when they are being registered for the first time. */
  person: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
  } | null;
}

const EMPTY_PERSON = { fullName: '', phone: '', email: '', address: '' };

function draftFrom(
  sponsor: SponsorAssignment | null,
  eventTypes: readonly EventType[],
): SponsorDraft {
  if (sponsor) {
    return {
      eventTypeId: sponsor.eventTypeId,
      instanceIdentifier: sponsor.instanceIdentifier,
      customInstanceName: sponsor.customInstanceName ?? '',
      userId: sponsor.userId,
      person: null,
    };
  }

  return {
    eventTypeId: eventTypes[0]?.id ?? 0,
    instanceIdentifier: null,
    customInstanceName: '',
    userId: '',
    person: { ...EMPTY_PERSON },
  };
}

interface SponsorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The registration being edited, or null to register somebody new. */
  sponsor: SponsorAssignment | null;
  eventTypes: readonly EventType[];
  /** Everyone who could be picked instead of being typed in. */
  directory: readonly SponsorUser[];
  assignments: readonly SponsorAssignment[];
  onSubmit: (draft: SponsorDraft) => void;
}

export function SponsorFormDialog({
  open,
  onOpenChange,
  sponsor,
  eventTypes,
  directory,
  assignments,
  onSubmit,
}: SponsorFormDialogProps) {
  const isEdit = sponsor !== null;

  const [draft, setDraft] = useState<SponsorDraft>(() =>
    draftFrom(sponsor, eventTypes),
  );
  const [source, setSource] = useState<Source>('New person');
  const [error, setError] = useState<string | null>(null);

  // Re-seed when opened for a different record — see the note in
  // `event-form-dialog.tsx` on why this happens during render.
  const seed = `${open}|${sponsor?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(sponsor, eventTypes));
    setSource('New person');
    setError(null);
  }

  const selectedType = useMemo(
    () => eventTypes.find((type) => type.id === draft.eventTypeId) ?? null,
    [eventTypes, draft.eventTypeId],
  );

  const directoryGroups = useMemo(
    () =>
      sponsorGroups(assignments, draft.eventTypeId, draft.instanceIdentifier, {
        directory,
      }),
    [assignments, directory, draft.eventTypeId, draft.instanceIdentifier],
  );

  const usesDirectory = isEdit || source === 'From directory';
  const person = draft.person ?? EMPTY_PERSON;

  function update<K extends keyof SponsorDraft>(key: K, value: SponsorDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updatePerson(key: keyof typeof EMPTY_PERSON, value: string) {
    setDraft((current) => ({
      ...current,
      person: { ...(current.person ?? EMPTY_PERSON), [key]: value },
    }));
  }

  /** Switching the event type can strand an instance the new type lacks. */
  function selectEventType(eventTypeId: number) {
    const nextType = eventTypes.find((type) => type.id === eventTypeId) ?? null;
    const limit = instanceCountOf(nextType);

    setDraft((current) => ({
      ...current,
      eventTypeId,
      instanceIdentifier:
        current.instanceIdentifier !== null && current.instanceIdentifier <= limit
          ? current.instanceIdentifier
          : null,
    }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const placement = {
      eventTypeId: draft.eventTypeId,
      instanceIdentifier: draft.instanceIdentifier,
      customInstanceName: draft.customInstanceName,
    };

    const result = usesDirectory
      ? validate(sponsorPlacementSchema, { ...placement, userId: draft.userId })
      : validate(newSponsorSchema, { ...placement, ...person });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError(null);

    onSubmit({
      ...placement,
      // A custom name labels one slot, so it goes with the instance.
      customInstanceName:
        draft.instanceIdentifier === null ? '' : draft.customInstanceName.trim(),
      userId: usesDirectory ? draft.userId : '',
      person: usesDirectory ? null : { ...person },
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Sponsor' : 'New Sponsor'}</DialogTitle>
          <DialogDescription>
            A sponsor belongs to an event type. Name an instance to tie them to
            one slot, or leave it as all instances and they will be offered for
            every occurrence of the type.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField id="sponsor-event-type" label="Event Type" required>
            <Combobox
              id="sponsor-event-type"
              value={draft.eventTypeId ? String(draft.eventTypeId) : null}
              groups={eventTypeGroups(eventTypes)}
              placeholder="Select an event type"
              searchPlaceholder="Search event types…"
              emptyMessage="No event type matches that search."
              onChange={(value) => selectEventType(Number(value))}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="sponsor-instance" label="Instance">
              <Combobox
                id="sponsor-instance"
                value={
                  draft.instanceIdentifier === null
                    ? ANY_INSTANCE
                    : String(draft.instanceIdentifier)
                }
                groups={instanceGroups(selectedType, { includeAny: true })}
                searchPlaceholder="Search instances…"
                emptyMessage="No instance matches that search."
                onChange={(value) =>
                  update(
                    'instanceIdentifier',
                    value === ANY_INSTANCE ? null : Number(value),
                  )
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
                placeholder="சப்பரம், தேர்…"
                disabled={draft.instanceIdentifier === null}
                onChange={(changeEvent) =>
                  update('customInstanceName', changeEvent.target.value)
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

          {!isEdit && (
            <SegmentedControl
              label="Where the sponsor comes from"
              options={SOURCES}
              value={source}
              onChange={setSource}
            />
          )}

          {usesDirectory ? (
            <FormField id="sponsor-user" label="Sponsor" required>
              <Combobox
                id="sponsor-user"
                value={draft.userId || null}
                groups={directoryGroups}
                placeholder="Select a devotee"
                searchPlaceholder="Search by name or address…"
                emptyMessage="Nobody in the directory matches that search."
                onChange={(value) => update('userId', value)}
              />
            </FormField>
          ) : (
            <>
              <FormField id="sponsor-name" label="Name" required>
                <Input
                  id="sponsor-name"
                  value={person.fullName}
                  placeholder="ம. கணேசன் மற்றும் குடும்பத்தினர்"
                  onChange={(changeEvent) =>
                    updatePerson('fullName', changeEvent.target.value)
                  }
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField id="sponsor-phone" label="Phone">
                  <Input
                    id="sponsor-phone"
                    value={person.phone}
                    placeholder="077 111 2222"
                    onChange={(changeEvent) =>
                      updatePerson('phone', changeEvent.target.value)
                    }
                  />
                </FormField>

                <FormField id="sponsor-email" label="Email">
                  <Input
                    id="sponsor-email"
                    type="email"
                    value={person.email}
                    placeholder="ganesan@example.com"
                    onChange={(changeEvent) =>
                      updatePerson('email', changeEvent.target.value)
                    }
                  />
                </FormField>
              </div>

              <FormField id="sponsor-address" label="Address">
                <Input
                  id="sponsor-address"
                  value={person.address}
                  placeholder="நல்லூர், யாழ்ப்பாணம்"
                  onChange={(changeEvent) =>
                    updatePerson('address', changeEvent.target.value)
                  }
                />
              </FormField>
            </>
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
              {isEdit ? 'Save Changes' : 'Register Sponsor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
