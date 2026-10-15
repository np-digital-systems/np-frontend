import type { ComboboxGroup, ComboboxOption } from '@/components/ui/combobox';

import type { EventSlot, EventType, SponsorAssignment, SponsorParty } from '../types';

import {
  DEFAULT_INSTANCE_COUNT,
  describeInstance,
} from './event-data';

export const UNASSIGNED = '__unassigned__';

export function eventTypeGroups(
  eventTypes: readonly EventType[],
): readonly ComboboxGroup[] {
  return [
    {
      options: eventTypes.map((type) => ({
        value: String(type.id),
        label: type.name,
        description: type.nameEn,
      })),
    },
  ];
}

export function instanceCountOf(eventType: EventType | null): number {
  return eventType
    ? Math.max(
        eventType.noOfInstances,
        DEFAULT_INSTANCE_COUNT[eventType.frequencyType],
      )
    : 1;
}

// `unassignedLabel` is for sponsors only; an event always belongs to a slot.
export function instanceGroups(
  slots: readonly EventSlot[],
  labelOf: (slot: EventSlot) => string,
  unassignedLabel?: string,
): readonly ComboboxGroup[] {
  if (slots.length === 0 && unassignedLabel === undefined) return [];

  const placements = slots.map((slot) => ({
    value: String(slot.instanceIdentifier),
    label: labelOf(slot),
    // Searchable by number even when the slot has a custom name.
    keywords: `#${slot.instanceIdentifier} ${slot.instanceIdentifier}`,
  }));

  return [
    {
      options:
        unassignedLabel === undefined
          ? placements
          : [
              { value: '', label: unassignedLabel, keywords: 'unassigned none later' },
              ...placements,
            ],
    },
  ];
}

interface SponsorGroupOptions {
  lead?: ComboboxOption;
  /** Shown last so any party can still be picked. */
  directory?: readonly SponsorParty[];
}

// Ordered: this instance's sponsors, then the type's sponsors, then the directory.
export function sponsorGroups(
  assignments: readonly SponsorAssignment[],
  eventTypeId: number,
  instanceIdentifier: number | null,
  { lead, directory }: SponsorGroupOptions = {},
): readonly ComboboxGroup[] {
  const forType = assignments.filter(
    (assignment) => assignment.eventTypeId === eventTypeId,
  );

  const eventTypeName = forType[0]?.eventType.name ?? 'this event type';

  // Matches nulls too: with no instance chosen, unassigned sponsors come first.
  const pinned = forType.filter(
    (assignment) => assignment.instanceIdentifier === instanceIdentifier,
  );

  const rest = forType.filter((assignment) => !pinned.includes(assignment));

  const seen = new Set<number>();
  const groups: ComboboxGroup[] = [];

  if (lead) groups.push({ options: [lead] });

  function take(
    heading: string,
    from: readonly SponsorAssignment[],
  ): void {
    const options = from
      .filter((assignment) => {
        if (seen.has(assignment.partyId)) return false;

        seen.add(assignment.partyId);

        return true;
      })
      .map((assignment) => ({
        value: String(assignment.partyId),
        label: assignment.sponsor.name,
        description: assignment.instanceLabel,
        keywords: assignment.sponsor.address,
      }));

    if (options.length > 0) groups.push({ heading, options });
  }

  if (pinned.length > 0) {
    take(
      describeInstance(
        forType[0].eventType.frequencyType,
        instanceIdentifier,
        pinned[0].customInstanceName,
      ),
      pinned,
    );
  }

  take(eventTypeName, rest);

  if (directory) {
    const others = directory
      .filter((sponsor) => !seen.has(sponsor.id))
      .map((sponsor) => ({
        value: String(sponsor.id),
        label: sponsor.name,
        description: sponsor.address || undefined,
      }));

    if (others.length > 0) {
      groups.push({
        heading: groups.length > (lead ? 1 : 0) ? 'Everyone else' : 'Directory',
        options: others,
      });
    }
  }

  return groups;
}
