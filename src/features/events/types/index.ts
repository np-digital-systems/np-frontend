import type { BadgeStatus } from '@/components/portal/ui';

/**
 * The events domain, shaped the way the API returns it.
 *
 * These mirror the `event_types`, `event_type_sponsors` and `events` tables
 * one-to-one — camelCased, dates as ISO strings, times as `HH:mm` — so
 * swapping mock data for a real service is a fetch change and nothing else.
 */

export type FrequencyType =
  | 'weekly'
  | 'monthly_twice'
  | 'monthly_once'
  | 'annual'
  | 'multi_day';

/** `event_types` — the permanent registry an admin configures once. */
export interface EventType {
  readonly id: number;
  /** Display name in Tamil, the language the temple keeps its calendar in. */
  readonly name: string;
  /** English rendering, shown as a secondary line for non-Tamil readers. */
  readonly nameEn: string;
  readonly frequencyType: FrequencyType;
  /** How many instances a full year of this type contains. */
  readonly noOfInstances: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * A registered user who can be assigned to an instance as its sponsor.
 *
 * Contact details are nullable because they are *withheld*, not missing:
 * roles without `event-sponsor:manage` never receive them. See
 * `lib/event-privacy.ts` — hiding a field in the markup while still sending
 * it down in the payload would not be access control.
 */
export interface SponsorUser {
  readonly id: string;
  readonly fullName: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly address: string;
}

/** `event_type_sponsors` — the traditional sponsor of a recurring slot. */
export interface EventTypeSponsor {
  readonly id: number;
  readonly eventTypeId: number;
  /** Context-dependent: week, lunar occurrence or festival day. */
  readonly instanceIdentifier: number;
  readonly customInstanceName: string | null;
  readonly userId: string;
  readonly createdAt: string;
}

/** `events` — one dated occurrence on the working calendar. */
export interface TempleEvent {
  readonly id: number;
  readonly eventTypeId: number;
  readonly instanceIdentifier: number;
  readonly customInstanceName: string | null;
  /** ISO `yyyy-mm-dd`. */
  readonly scheduledDate: string;
  /** 24-hour `HH:mm`. */
  readonly startTime: string;
  readonly endTime: string | null;
  /** Null means the slot has not been assigned to a sponsor yet. */
  readonly sponsorId: string | null;
  readonly notes: string | null;
  readonly isCompleted: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * A calendar row with its foreign keys already resolved.
 *
 * Assembled once at the feature boundary so no component has to carry a
 * lookup table around just to render a name.
 */
export interface EventRecord extends TempleEvent {
  readonly eventType: EventType;
  readonly sponsor: SponsorUser | null;
  /** "Day 3", "Week 24", "Valarpirai" — whatever the frequency means here. */
  readonly instanceLabel: string;
  readonly status: BadgeStatus;
}

/** One planned slot of an event type, with the date it landed on (if any). */
export interface ScheduleSlot {
  readonly instanceIdentifier: number;
  readonly instanceLabel: string;
  readonly customInstanceName: string | null;
  /** The traditional sponsor from `event_type_sponsors`, if one is set. */
  readonly defaultSponsor: SponsorUser | null;
  /** The dated occurrence for this slot, once it has been calendared. */
  readonly event: EventRecord | null;
}

/** An event type together with the state of its year. */
export interface ScheduleGroup {
  readonly eventType: EventType;
  readonly slots: readonly ScheduleSlot[];
  readonly scheduledCount: number;
  readonly sponsoredCount: number;
}

/** An event type with the state of its year attached, for the master list. */
export interface EventTypeRecord extends EventType {
  /** Standing sponsor mappings in `event_type_sponsors` for this type. */
  readonly sponsorSlots: number;
  /** Dated occurrences already on the calendar for the active year. */
  readonly scheduledCount: number;
}

/** A row of the sponsor directory: one `event_type_sponsors` mapping. */
export interface SponsorAssignment extends EventTypeSponsor {
  readonly eventType: EventType;
  readonly sponsor: SponsorUser;
  readonly instanceLabel: string;
  /** Dated occurrences this standing assignment covers in the active year. */
  readonly occurrences: number;
}

export interface EventsSummary {
  readonly total: number;
  readonly upcoming: number;
  readonly completed: number;
  readonly unsponsored: number;
}
