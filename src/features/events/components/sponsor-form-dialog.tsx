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
  /** Set when the sponsor is a party already on record. */
  partyId: number | null;
  /**
   * Set instead when they are being registered for the first time, from the
   * name typed into the picker. A name and a phone number is all the temple
   * has for most sponsors; email and address belong to a sign-in, and a
   * sponsor does not need one.
   */
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
  /** The registration being edited, or null to register somebody new. */
  sponsor: SponsorAssignment | null;
  eventTypes: readonly EventType[];
  /** Everyone who could be picked instead of being typed in. */
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

  // Re-seed when opened for a different record — see the note in
  // `event-form-dialog.tsx` on why this happens during render.
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

  /*
   * The slots of the chosen type, loaded when it changes.
   *
   * Read rather than counted off the type, because the picker has to show the
   * temple's own name for a slot where it has one — twelve monthly slots read
   * as twelve Tamil months, not twelve identical "மாதாந்திரம்" rows.
   */
  const [slots, setSlots] = useState<readonly EventSlot[]>([]);

  useEffect(() => {
    const eventTypeId = draft.eventTypeId;
    let current = true;

    // Resolved through a promise either way, so the only write happens once
    // the load settles and a type cleared mid-flight cannot land stale slots.
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

  /*
   * The name typed into the picker becomes the new party's name. A clerk
   * registering somebody the temple has never dealt with types them in where
   * they looked for them, rather than being sent to another screen first.
   */
  function startNewParty(typed: string) {
    setDraft((current) => ({
      ...current,
      partyId: null,
      newParty: { ...EMPTY_PARTY, nameTa: typed },
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
            {/*
              * Always one slot. Every type has them, so "all instances" only
              * ever meant a row per slot — and the schedule had to fan it back
              * out to them anyway.
              */}
            <FormField id="sponsor-instance" label="Instance" required>
              <Combobox
                id="sponsor-instance"
                value={
                  draft.instanceIdentifier === null
                    ? ''
                    : String(draft.instanceIdentifier)
                }
                groups={instanceGroups(slots, labelForSlot)}
                searchPlaceholder="Search instances…"
                emptyMessage="No instance matches that search."
                onChange={(value) => update('instanceIdentifier', Number(value))}
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
            /*
              * Registering somebody new, inline. The picker is left in place
              * above so the way back is obvious — a clerk who mistypes a name
              * that does exist can pick the real one without losing the slot
              * they had already chosen.
              */
            <div className="flex flex-col gap-4 rounded-lg border border-accent bg-surface-2 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs text-text-secondary">
                  Registering a new sponsor. They are added to the parties list
                  and do not need a sign-in.
                </p>

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
              hint="Anyone the temple already deals with can sponsor — a vendor as readily as a devotee. Type a new name to register somebody."
            >
              <EntityCombobox
                id="sponsor-party"
                value={draft.partyId === null ? null : String(draft.partyId)}
                groups={directoryGroups}
                placeholder="Search or type a name"
                searchPlaceholder="Search by name…"
                emptyMessage="Nobody matches that search."
                createLabel={(typed) => `Register “${typed}” as a new sponsor`}
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
              {isEdit ? 'Save Changes' : 'Register Sponsor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
