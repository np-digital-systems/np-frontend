
export type SubscriptionFrequency = 'monthly' | 'annual';

export type MemberStatus = 'active' | 'lapsed' | 'inactive';

export interface SanththaMember {
  readonly id: number;
    readonly memberNo: string;
  readonly fullName: string;
  readonly nameTa: string;
  readonly phone: string;
  readonly address: string;
    readonly subscriptionAmount: number;
  readonly frequency: SubscriptionFrequency;
  readonly joinedOn: string;
  readonly status: MemberStatus;
  readonly notes: string | null;
}

export interface SanththaPayment {
  readonly id: number;
  readonly memberId: number;
    readonly period: string;
  readonly amount: number;
  readonly paidOn: string;
    readonly receiptRef: string | null;
  readonly mode: 'cash' | 'bank' | 'online';
  readonly collectedBy: string;
}

export interface MemberRecord extends SanththaMember {
    readonly dueForYear: number;
  readonly paidForYear: number;
  readonly outstanding: number;
    readonly periodsPaid: number;
  readonly periodsExpected: number;
  readonly lastPaidOn: string | null;
  readonly isFullyPaid: boolean;
    readonly isInArrears: boolean;
  readonly payments: readonly SanththaPayment[];
}

export interface SanththaSummary {
  readonly members: number;
  readonly activeMembers: number;
  readonly expected: number;
  readonly collected: number;
  readonly outstanding: number;
  readonly inArrears: number;
  readonly fullyPaid: number;
  readonly collectionRate: number;
}

export interface CollectionPoint {
  readonly label: string;
  readonly amount: number;
  readonly count: number;
}
