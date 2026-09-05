import type { BadgeStatus } from '@/components/portal/ui';

export type FrequencyType =
  | 'weekly'
  | 'monthly_twice'
  | 'monthly_once'
  | 'annual'
  | 'multi_day';

export interface EventType {
  readonly id: number;
    readonly name: string;
    readonly nameEn: string;
  readonly frequencyType: FrequencyType;
    readonly noOfInstances: number;
  /** The activity a receipt for this pooja is coded to; it carries the fund. */
  readonly activityId: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * A sponsor, as the calendar knows one.
 *
 * A party, not an account. Sponsorship is a dealing the temple has with
 * somebody; whether they can also sign in is a separate question, and for most
 * of them the answer is no. Email and address come from the linked sign-in
 * where there is one, and are empty otherwise.
 */
export interface SponsorParty {
  readonly id: number;
  readonly name: string;
  readonly nameEn: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly address: string;
  readonly userId: string | null;
}

/**
 * A sponsor registered against an event type. A null `instanceIdentifier`
 * means they stand for every instance of the type rather than one slot.
 */
export interface EventTypeSponsor {
  readonly id: number;
  readonly eventTypeId: number;
  readonly instanceIdentifier: number | null;
  readonly customInstanceName: string | null;
  readonly partyId: number;
  readonly createdAt: string;
}

export interface TempleEvent {
  readonly id: number;
  readonly eventTypeId: number;
  readonly instanceIdentifier: number;
  readonly customInstanceName: string | null;
    readonly scheduledDate: string;
    readonly startTime: string;
  readonly endTime: string | null;
    readonly sponsorPartyId: number | null;
  readonly notes: string | null;
  readonly isCompleted: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface EventRecord extends TempleEvent {
  readonly eventType: EventType;
  readonly sponsor: SponsorParty | null;
    readonly instanceLabel: string;
  readonly status: BadgeStatus;
}

export interface ScheduleSlot {
  readonly instanceIdentifier: number;
  readonly instanceLabel: string;
  readonly customInstanceName: string | null;
    readonly defaultSponsor: SponsorParty | null;
  readonly sponsorCount: number;
  /** Dates scheduled against this slot this year; a monthly slot carries several. */
  readonly eventCount: number;
  readonly event: EventRecord | null;
}

export interface ScheduleGroup {
  readonly eventType: EventType;
  readonly slots: readonly ScheduleSlot[];
  readonly scheduledCount: number;
  readonly sponsoredCount: number;
}

export interface EventTypeRecord extends EventType {
    readonly sponsorSlots: number;
    readonly scheduledCount: number;
}

export interface SponsorAssignment extends EventTypeSponsor {
  readonly eventType: EventType;
  readonly sponsor: SponsorParty;
  readonly instanceLabel: string;
    readonly occurrences: number;
}

export interface EventsSummary {
  readonly total: number;
  readonly upcoming: number;
  readonly completed: number;
  readonly unsponsored: number;
}

export type { PublicEvent } from './public';
