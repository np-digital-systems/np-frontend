/**
 * Temple contributions — the Sanththa register.
 *
 * Sanththa (சந்தா) is the members' subscription: families on the register
 * pledge an amount each year or each month, and the temple tracks who has
 * paid, who is behind and by how much. It is the temple's membership roll as
 * much as it is a collection ledger, which is why a lapsed member stays on
 * it rather than being deleted.
 */

export type SubscriptionFrequency = 'monthly' | 'annual';

export type MemberStatus = 'active' | 'lapsed' | 'inactive';

/** `sanththa_members` — one subscribing family or individual. */
export interface SanththaMember {
  readonly id: number;
  /** Membership number written on the receipt book. */
  readonly memberNo: string;
  readonly fullName: string;
  readonly nameTa: string;
  readonly phone: string;
  readonly address: string;
  /** What the member pledged, per period of their frequency. */
  readonly subscriptionAmount: number;
  readonly frequency: SubscriptionFrequency;
  readonly joinedOn: string;
  readonly status: MemberStatus;
  readonly notes: string | null;
}

/** `sanththa_payments` — one subscription payment against a period. */
export interface SanththaPayment {
  readonly id: number;
  readonly memberId: number;
  /**
   * The period being paid for: `2026` for an annual subscription, `2026-08`
   * for a monthly one. Stored as text because it is a label, not a date.
   */
  readonly period: string;
  readonly amount: number;
  readonly paidOn: string;
  /** The receipt voucher raised for it, once accounting has one. */
  readonly receiptRef: string | null;
  readonly mode: 'cash' | 'bank' | 'online';
  readonly collectedBy: string;
}

/** A member with the year's dues and payments worked out. */
export interface MemberRecord extends SanththaMember {
  /** What this member owes for the active year. */
  readonly dueForYear: number;
  readonly paidForYear: number;
  readonly outstanding: number;
  /** Periods paid out of the periods expected — 8 of 12, or 1 of 1. */
  readonly periodsPaid: number;
  readonly periodsExpected: number;
  readonly lastPaidOn: string | null;
  readonly isFullyPaid: boolean;
  /** Behind on the register: owes money and is still an active member. */
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

/** Collections in one month of the active year, for the trend strip. */
export interface CollectionPoint {
  readonly label: string;
  readonly amount: number;
  readonly count: number;
}
