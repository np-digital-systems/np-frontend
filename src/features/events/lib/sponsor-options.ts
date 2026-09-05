import type { ComboboxGroup, ComboboxOption } from '@/components/ui/combobox';

import type { EventType, SponsorAssignment, SponsorParty } from '../types';

import {
  ANY_INSTANCE_LABEL,
  DEFAULT_INSTANCE_COUNT,
  describeInstance,
} from './event-data';

/** The instance picker's stand-in for "no instance — every one of them". */
export const ANY_INSTANCE = '__any__';

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
 * Every instance of an event type.
 *
 * `includeAny` adds the "all instances" choice a sponsor takes when they give
 * to the type as a whole; a dated occurrence always falls on one instance, so
 * the event form leaves it out.
 */
export function instanceGroups(
  eventType: EventType | null,
  { includeAny = false }: { includeAny?: boolean } = {},
): readonly ComboboxGroup[] {
  const anyGroup: ComboboxGroup = {
    options: [
      {
        value: ANY_INSTANCE,
        label: ANY_INSTANCE_LABEL,
        description: 'Offered for every instance of this event type',
      },
    ],
  };

  if (!eventType) return includeAny ? [anyGroup] : [];

  const instances: ComboboxGroup = {
    heading: includeAny ? 'Instances' : undefined,
    options: Array.from({ length: instanceCountOf(eventType) }, (_, index) => {
      const instanceIdentifier = index + 1;

      return {
        value: String(instanceIdentifier),
        label: describeInstance(eventType.frequencyType, instanceIdentifier),
        keywords: `#${instanceIdentifier}`,
      };
    }),
  };

  return includeAny ? [anyGroup, instances] : [instances];
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

  const pinned =
    instanceIdentifier === null
      ? []
      : forType.filter(
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
