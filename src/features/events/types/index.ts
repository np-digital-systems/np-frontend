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
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SponsorUser {
  readonly id: string;
  readonly fullName: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly address: string;
}

export interface EventTypeSponsor {
  readonly id: number;
  readonly eventTypeId: number;
    readonly instanceIdentifier: number;
  readonly customInstanceName: string | null;
  readonly userId: string;
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
    readonly sponsorId: string | null;
  readonly notes: string | null;
  readonly isCompleted: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface EventRecord extends TempleEvent {
  readonly eventType: EventType;
  readonly sponsor: SponsorUser | null;
    readonly instanceLabel: string;
  readonly status: BadgeStatus;
}

export interface ScheduleSlot {
  readonly instanceIdentifier: number;
  readonly instanceLabel: string;
  readonly customInstanceName: string | null;
    readonly defaultSponsor: SponsorUser | null;
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
  readonly sponsor: SponsorUser;
  readonly instanceLabel: string;
    readonly occurrences: number;
}

export interface EventsSummary {
  readonly total: number;
  readonly upcoming: number;
  readonly completed: number;
  readonly unsponsored: number;
}
