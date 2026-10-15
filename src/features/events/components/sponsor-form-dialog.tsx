'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { FormField } from '@/components/portal/ui';
import { validate } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { EntityCombobox } from '@/components/ui/entity-combobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { loadEventSlots } from '../lib/event-actions';
import { slotLabel } from '../lib/public-event-presentation';
import { newSponsorSchema, sponsorPlacementSchema } from '../lib/event-schemas';
import {
  eventTypeGroups,
  instanceCountOf,
  instanceGroups,
  sponsorGroups,
} from '../lib/sponsor-options';
import type { EventSlot, EventType, SponsorAssignment, SponsorParty } from '../types';

export interface SponsorDraft {
  eventTypeId: number;
  instanceIdentifier: number | null;
  /** Set for an existing party. */
  partyId: number | null;
  /** Set instead when registering a new party. */
  newParty: { nameTa: string; nameEn: string; phone: string } | null;
}

const EMPTY_PARTY = { nameTa: '', nameEn: '', phone: '' };

function draftFrom(
  sponsor: SponsorAssignment | null,
  eventTypes: readonly EventType[],
): SponsorDraft {
  if (sponsor) {
    return {
      eventTypeId: sponsor.eventTypeId,
      instanceIdentifier: sponsor.instanceIdentifier,
      partyId: sponsor.partyId,
      newParty: null,
    };
  }

  return {
    eventTypeId: eventTypes[0]?.id ?? 0,
    instanceIdentifier: null,
    partyId: null,
    newParty: null,
  };
}

interface SponsorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null to create a new sponsorship. */
  sponsor: SponsorAssignment | null;
  eventTypes: readonly EventType[];
  directory: readonly SponsorParty[];
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
  const [error, setError] = useState<string | null>(null);

  // Reset the draft when opened for a different record.
  const seed = `${open}|${sponsor?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(sponsor, eventTypes));
    setError(null);
  }

  const selectedType = useMemo(
    () => eventTypes.find((type) => type.id === draft.eventTypeId) ?? null,
    [eventTypes, draft.eventTypeId],
  );

  const tInstance = useTranslations('Events.instance');

  // Loaded rather than derived from the type so custom slot names can be shown.
  const [slots, setSlots] = useState<readonly EventSlot[]>([]);

  useEffect(() => {
    const eventTypeId = draft.eventTypeId;
    let current = true;

    // Always async so a type changed mid-load can't set stale slots.
    Promise.resolve(eventTypeId ? loadEventSlots(eventTypeId) : []).then((loaded) => {
      if (current) setSlots(loaded);
    });

    return () => {
      current = false;
    };
  }, [draft.eventTypeId]);

  const labelForSlot = (slot: EventSlot) =>
    slotLabel(
      {
        customInstanceName: slot.customInstanceName,
        instanceIdentifier: slot.instanceIdentifier,
        frequencyType: selectedType?.frequencyType ?? 'annual',
      },
      tInstance,
    );

  const labelForInstance = (instanceIdentifier: number) => {
    const slot = slots.find((row) => row.instanceIdentifier === instanceIdentifier);

    return slot ? labelForSlot(slot) : `#${instanceIdentifier}`;
  };

  const directoryGroups = useMemo(
    () =>
      sponsorGroups(assignments, draft.eventTypeId, draft.instanceIdentifier, {
        directory,
      }),
    [assignments, directory, draft.eventTypeId, draft.instanceIdentifier],
  );

  const newParty = draft.newParty;

  function update<K extends keyof SponsorDraft>(key: K, value: SponsorDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateNewParty(key: keyof typeof EMPTY_PARTY, value: string) {
    setDraft((current) => ({
      ...current,
      newParty: { ...(current.newParty ?? EMPTY_PARTY), [key]: value },
    }));
  }

  function startNewParty(typed: string) {
    setDraft((current) => ({
      ...current,
      partyId: null,
      newParty: { ...EMPTY_PARTY, nameTa: typed },
    }));
  }

  // Clear the instance if the new type doesn't have it.
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
    };

    const result = newParty
      ? validate(newSponsorSchema, { ...placement, ...newParty })
      : validate(sponsorPlacementSchema, { ...placement, partyId: draft.partyId });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError(null);

    onSubmit({
      ...placement,
      partyId: newParty ? null : draft.partyId,
      newParty: newParty ? { ...newParty } : null,
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit sponsorship' : 'Add sponsorship'}
          </DialogTitle>
          <DialogDescription>
            Leave the instance empty to cover every occurrence.
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
                    ? ''
                    : String(draft.instanceIdentifier)
                }
                groups={instanceGroups(slots, labelForSlot, tInstance('unassigned'))}
                searchPlaceholder="Search instances…"
                emptyMessage="No instance matches that search."
                onChange={(value) =>
                  update('instanceIdentifier', value === '' ? null : Number(value))
                }
              />
            </FormField>
          </div>

          {selectedType && (
            <p className="-mt-1 rounded-lg bg-surface-2 px-3 py-2 text-xs text-text-secondary">
              Sponsoring{' '}
              <span className="font-medium text-text-primary">
                {selectedType.name}
                {draft.instanceIdentifier !== null &&
                  ` — ${labelForInstance(draft.instanceIdentifier)}`}
              </span>
            </p>
          )}

          {newParty ? (
            <div className="flex flex-col gap-4 rounded-lg border border-accent bg-surface-2 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs text-text-secondary">New sponsor</p>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => update('newParty', null)}
                >
                  Pick instead
                </Button>
              </div>

              <FormField id="sponsor-name" label="Name (Tamil)" required>
                <Input
                  id="sponsor-name"
                  value={newParty.nameTa}
                  placeholder="ம. கணேசன் மற்றும் குடும்பத்தினர்"
                  onChange={(changeEvent) =>
                    updateNewParty('nameTa', changeEvent.target.value)
                  }
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField id="sponsor-name-en" label="Name (English)">
                  <Input
                    id="sponsor-name-en"
                    value={newParty.nameEn}
                    placeholder="M. Ganesan & family"
                    onChange={(changeEvent) =>
                      updateNewParty('nameEn', changeEvent.target.value)
                    }
                  />
                </FormField>

                <FormField id="sponsor-phone" label="Phone">
                  <Input
                    id="sponsor-phone"
                    value={newParty.phone}
                    inputMode="tel"
                    placeholder="077 111 2222"
                    onChange={(changeEvent) =>
                      updateNewParty('phone', changeEvent.target.value)
                    }
                  />
                </FormField>
              </div>
            </div>
          ) : (
            <FormField
              id="sponsor-party"
              label="Sponsor"
              required
            >
              <EntityCombobox
                id="sponsor-party"
                value={draft.partyId === null ? null : String(draft.partyId)}
                groups={directoryGroups}
                placeholder="Search or type a name"
                searchPlaceholder="Search by name…"
                emptyMessage="Nobody matches that search."
                createLabel={(typed) => `Add “${typed}” as a new sponsor`}
                onCreate={startNewParty}
                onChange={(value) =>
                  update('partyId', value === null ? null : Number(value))
                }
              />
            </FormField>
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
              {isEdit ? 'Save' : 'Add sponsorship'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
