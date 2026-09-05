import type {
  EventRecord,
  ScheduleGroup,
  SponsorAssignment,
  SponsorParty,
} from '../types';

function redact(sponsor: SponsorParty): SponsorParty {
  return { ...sponsor, phone: null, email: null };
}

export function redactSponsor(
  sponsor: SponsorParty | null,
  canSeeContact: boolean,
): SponsorParty | null {
  if (canSeeContact || sponsor === null) return sponsor;

  return redact(sponsor);
}

export function redactSponsors(
  sponsors: readonly SponsorParty[],
  canSeeContact: boolean,
): readonly SponsorParty[] {
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
