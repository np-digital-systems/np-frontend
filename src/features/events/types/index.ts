export type EventFunding = 'sponsored' | 'general';

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
  /** `general` is funded by collection and never has a named sponsor. */
  readonly funding: EventFunding;
    readonly noOfInstances: number;
  /** Receipts are coded to this activity, which carries the fund. */
  readonly activityId: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// A party, not a user account. Email and address are empty unless linked to a sign-in.
export interface SponsorParty {
  readonly id: number;
  readonly name: string;
  readonly nameEn: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly address: string;
  readonly userId: string | null;
}

export interface EventTypeSponsor {
  readonly id: number;
  readonly eventTypeId: number;
  /** Null covers every instance of the type. */
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
  readonly slotId: number;
  readonly instanceIdentifier: number;
  readonly instanceLabel: string;
  readonly customInstanceName: string | null;
    readonly defaultSponsor: SponsorParty | null;
  readonly sponsors: readonly SponsorParty[];
  readonly sponsorCount: number;
  /** Dates scheduled this year; monthly slots can have several. */
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

export interface EventSlot {
  readonly id: number;
  readonly instanceIdentifier: number;
  readonly customInstanceName: string | null;
  readonly instanceLabel: string;
  readonly isActive: boolean;
  readonly sponsorNames: readonly string[];
  readonly scheduledCount: number;
}
