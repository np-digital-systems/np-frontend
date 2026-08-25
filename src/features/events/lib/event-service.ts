import { allSponsors } from './sponsor-store';
import {
  EVENT_TYPES,
  EVENT_TYPE_SPONSORS,
  TEMPLE_EVENTS,
} from '../constants/mock-data';
import type {
  EventRecord,
  EventType,
  ScheduleGroup,
  ScheduleSlot,
  SponsorAssignment,
  SponsorUser,
  TempleEvent,
} from '../types';

import { describeInstance, deriveStatus, getToday, sortByDate } from './event-data';

/** TODO: replace the module-level constants with calls to the events API. */

function indexBy<T, K extends string | number>(
  items: readonly T[],
  key: (item: T) => K,
): Map<K, T> {
  return new Map(items.map((item) => [key(item), item]));
}

const typesById = indexBy(EVENT_TYPES, (type) => type.id);
// Rebuilt per call so sponsors registered at runtime resolve too.
function usersById() {
  return indexBy(allSponsors(), (user) => user.id);
}

function toRecord(event: TempleEvent, today: string): EventRecord {
  const eventType = typesById.get(event.eventTypeId);

  if (!eventType) {
    throw new Error(`Event ${event.id} references unknown type ${event.eventTypeId}`);
  }

  return {
    ...event,
    eventType,
    sponsor: event.sponsorId ? usersById().get(event.sponsorId) ?? null : null,
    instanceLabel: describeInstance(
      eventType.frequencyType,
      event.instanceIdentifier,
      event.customInstanceName,
    ),
    status: deriveStatus(event, today),
  };
}

export function getEventTypes(): readonly EventType[] {
  return EVENT_TYPES;
}

export function getSponsorUsers(): readonly SponsorUser[] {
  return allSponsors();
}

export function getEvents(today: string = getToday()): readonly EventRecord[] {
  return sortByDate(TEMPLE_EVENTS.map((event) => toRecord(event, today)));
}

export function getSponsorAssignments(
  today: string = getToday(),
): readonly SponsorAssignment[] {
  const events = getEvents(today);

  return EVENT_TYPE_SPONSORS.flatMap((assignment) => {
    const eventType = typesById.get(assignment.eventTypeId);
    const sponsor = usersById().get(assignment.userId);

    // A mapping whose type or user has been removed is data to fix, not a
    // row to render — drop it rather than rendering a half-empty line.
    if (!eventType || !sponsor) return [];

    return [
      {
        ...assignment,
        eventType,
        sponsor,
        instanceLabel: describeInstance(
          eventType.frequencyType,
          assignment.instanceIdentifier,
          assignment.customInstanceName,
        ),
        occurrences: events.filter(
          (event) =>
            event.eventTypeId === assignment.eventTypeId &&
            event.instanceIdentifier === assignment.instanceIdentifier,
        ).length,
      },
    ];
  });
}

export function getScheduleGroups(
  today: string = getToday(),
): readonly ScheduleGroup[] {
  const events = getEvents(today);

  return EVENT_TYPES.map((eventType) => {
    const typeEvents = events.filter(
      (event) => event.eventTypeId === eventType.id,
    );

    const typeSponsors = EVENT_TYPE_SPONSORS.filter(
      (assignment) => assignment.eventTypeId === eventType.id,
    );

    const dense = eventType.noOfInstances > 12;

    const identifiers = dense
      ? [
          ...new Set([
            ...typeEvents.map((event) => event.instanceIdentifier),
            ...typeSponsors.map((assignment) => assignment.instanceIdentifier),
          ]),
        ].sort((a, b) => a - b)
      : Array.from({ length: eventType.noOfInstances }, (_, index) => index + 1);

    const slots: ScheduleSlot[] = identifiers.map((instanceIdentifier) => {
      const event =
        typeEvents.find(
          (candidate) => candidate.instanceIdentifier === instanceIdentifier,
        ) ?? null;

      const assignment = typeSponsors.find(
        (candidate) => candidate.instanceIdentifier === instanceIdentifier,
      );

      const customInstanceName =
        event?.customInstanceName ?? assignment?.customInstanceName ?? null;

      return {
        instanceIdentifier,
        customInstanceName,
        instanceLabel: describeInstance(
          eventType.frequencyType,
          instanceIdentifier,
          customInstanceName,
        ),
        defaultSponsor: assignment
          ? usersById().get(assignment.userId) ?? null
          : null,
        event,
      };
    });

    return {
      eventType,
      slots,
      scheduledCount: typeEvents.length,
      sponsoredCount: typeEvents.filter((event) => event.sponsorId !== null)
        .length,
    };
  });
}

export function countSponsorSlots(eventTypeId: number): number {
  return EVENT_TYPE_SPONSORS.filter(
    (assignment) => assignment.eventTypeId === eventTypeId,
  ).length;
}

export function countScheduledEvents(eventTypeId: number): number {
  return TEMPLE_EVENTS.filter((event) => event.eventTypeId === eventTypeId)
    .length;
}
