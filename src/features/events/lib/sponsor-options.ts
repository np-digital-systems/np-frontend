import type { ComboboxGroup, ComboboxOption } from '@/components/ui/combobox';

import type { EventSlot, EventType, SponsorAssignment, SponsorParty } from '../types';

import {
  DEFAULT_INSTANCE_COUNT,
  describeInstance,
} from './event-data';

/** The event form's stand-in for an occurrence nobody has taken yet. */
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

/**
 * The slots of an event type, as the picker lists them.
 *
 * Built from the slots themselves rather than counted off the type, so the
 * temple's own name for a slot is what shows: மகோற்சவம் day 11 reads by its
 * name, and twelve monthly slots read as twelve Tamil months instead of
 * twelve identical "மாதாந்திரம்" rows with nothing to tell them apart.
 *
 * `unassignedLabel` leads the list with the choice not to place it at all, and
 * is for sponsors alone: registering the name and settling the occasion later
 * is how most of that register is filled, and picking it again is how somebody
 * comes back off a slot they were given by mistake. An occurrence has no such
 * state — a date always belongs to one slot — so the event form omits it.
 */
export function instanceGroups(
  slots: readonly EventSlot[],
  labelOf: (slot: EventSlot) => string,
  unassignedLabel?: string,
): readonly ComboboxGroup[] {
  if (slots.length === 0 && unassignedLabel === undefined) return [];

  const placements = slots.map((slot) => ({
    value: String(slot.instanceIdentifier),
    label: labelOf(slot),
    // Searchable by number even when it is named, so a clerk who knows it
    // as "day 11" still finds it.
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
  /** Prepended above everything, e.g. the event form's "Unassigned". */
  lead?: ComboboxOption;
  /** Everyone in the directory, shown last so nobody becomes unreachable. */
  directory?: readonly SponsorParty[];
}

/**
 * The sponsor list for a slot, most relevant first.
 *
 * Picking an event type is what makes this list usable: the people registered
 * against it rise to the top, and naming an instance lifts that instance's own
 * sponsors above the rest. Everybody else stays reachable further down, so a
 * one-off sponsor never has to be registered first.
 */
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

  // A straight match, nulls included: with no instance chosen, the people
  // shown first are the ones also waiting to be given one.
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
