import type {
  EventRecord,
  ScheduleGroup,
  SponsorAssignment,
  SponsorUser,
} from '../types';

/**
 * Contact-detail redaction.
 *
 * A role that cannot see a sponsor's phone and email must not be *sent*
 * them — a server component's props travel to the browser in the RSC
 * payload, so a conditional in the markup hides the field from the eye and
 * from nothing else. Every boundary that hands sponsor data to a client
 * component passes it through here first.
 */

function redact(sponsor: SponsorUser): SponsorUser {
  return { ...sponsor, phone: null, email: null };
}

export function redactSponsor(
  sponsor: SponsorUser | null,
  canSeeContact: boolean,
): SponsorUser | null {
  if (canSeeContact || sponsor === null) return sponsor;

  return redact(sponsor);
}

export function redactSponsors(
  sponsors: readonly SponsorUser[],
  canSeeContact: boolean,
): readonly SponsorUser[] {
  if (canSeeContact) return sponsors;

  return sponsors.map(redact);
}

export function redactEvents(
  events: readonly EventRecord[],
  canSeeContact: boolean,
): readonly EventRecord[] {
  if (canSeeContact) return events;

  return events.map((event) => ({
    ...event,
    sponsor: redactSponsor(event.sponsor, false),
  }));
}

export function redactAssignments(
  assignments: readonly SponsorAssignment[],
  canSeeContact: boolean,
): readonly SponsorAssignment[] {
  if (canSeeContact) return assignments;

  return assignments.map((assignment) => ({
    ...assignment,
    sponsor: redact(assignment.sponsor),
  }));
}

export function redactScheduleGroups(
  groups: readonly ScheduleGroup[],
  canSeeContact: boolean,
): readonly ScheduleGroup[] {
  if (canSeeContact) return groups;

  return groups.map((group) => ({
    ...group,
    slots: group.slots.map((slot) => ({
      ...slot,
      defaultSponsor: redactSponsor(slot.defaultSponsor, false),
      event: slot.event
        ? { ...slot.event, sponsor: redactSponsor(slot.event.sponsor, false) }
        : null,
    })),
  }));
}
