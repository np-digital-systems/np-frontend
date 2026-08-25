import {
  EVENT_TYPES,
  EVENT_TYPE_SPONSORS,
  SPONSOR_USERS,
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

/**
 * The read layer for the events module.
 *
 * Everything a screen needs is assembled here, on the server, with foreign
 * keys already resolved — so no component ever carries a lookup table
 * around just to print a sponsor's name. Each function is the seam a real
 * `fetch` will slot into; the signatures are what the pages depend on.
 *
 * TODO: replace the module-level constants with calls to the events API.
 */

function indexBy<T, K extends string | number>(
  items: readonly T[],
  key: (item: T) => K,
): Map<K, T> {
  return new Map(items.map((item) => [key(item), item]));
}

const typesById = indexBy(EVENT_TYPES, (type) => type.id);
const usersById = indexBy(SPONSOR_USERS, (user) => user.id);

function toRecord(event: TempleEvent, today: string): EventRecord {
  const eventType = typesById.get(event.eventTypeId);

  if (!eventType) {
    throw new Error(`Event ${event.id} references unknown type ${event.eventTypeId}`);
  }

  return {
    ...event,
    eventType,
    sponsor: event.sponsorId ? usersById.get(event.sponsorId) ?? null : null,
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
  return SPONSOR_USERS;
}

/** Every calendared occurrence, date-ordered, keys resolved. */
export function getEvents(today: string = getToday()): readonly EventRecord[] {
  return sortByDate(TEMPLE_EVENTS.map((event) => toRecord(event, today)));
}

/** How many event types currently hold a standing sponsor for a slot. */
export function getSponsorAssignments(
  today: string = getToday(),
): readonly SponsorAssignment[] {
  const events = getEvents(today);

  return EVENT_TYPE_SPONSORS.flatMap((assignment) => {
    const eventType = typesById.get(assignment.eventTypeId);
    const sponsor = usersById.get(assignment.userId);

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

/**
 * The year seen as planning slots rather than as a flat calendar.
 *
 * For each event type it walks the instances the type declares and reports
 * which are dated, which carry a standing sponsor, and which are still
 * empty — the question the yearly schedule screen exists to answer.
 *
 * Weekly types declare 52 slots; listing every one of them would bury the
 * page, so only the slots that are dated or sponsored are materialised and
 * the untouched remainder is reported as a count.
 */
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
          ? usersById.get(assignment.userId) ?? null
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

/** Slot counts per type, for the event-types master list. */
export function countSponsorSlots(eventTypeId: number): number {
  return EVENT_TYPE_SPONSORS.filter(
    (assignment) => assignment.eventTypeId === eventTypeId,
  ).length;
}

export function countScheduledEvents(eventTypeId: number): number {
  return TEMPLE_EVENTS.filter((event) => event.eventTypeId === eventTypeId)
    .length;
}
