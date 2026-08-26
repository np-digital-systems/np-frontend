/**
 * Sanththa — the temple's yearly membership subscription.
 *
 * One flat rate per member per year. A member pays it once, whatever else
 * they do at the temple: sponsoring two poojas does not make it two
 * subscriptions.
 */

/**
 * A subscribing family or trust.
 *
 * Keyed by the user id, because the register is not a table of its own: a
 * non-null member number on `users` is what membership means.
 */
export interface SanththaMember {
  readonly id: string;
  readonly memberNo: string;
  readonly fullName: string;
  readonly nameTa: string;
  readonly phone: string;
  readonly address: string;
  readonly joinedOn: string;
  readonly isActive: boolean;
  readonly notes: string | null;
}

export type PaymentMode = 'cash' | 'bank' | 'online';

/** `sanththa_payments` — at most one row per member per year. */
export interface SanththaPayment {
  readonly id: number;
  readonly memberId: string;
  readonly year: number;
  readonly amount: number;
  readonly paidOn: string;
  /** The receipt voucher this subscription was collected on. */
  readonly receiptRef: string | null;
  readonly mode: PaymentMode;
  readonly collectedBy: string;
}

/** A member with this year's subscription resolved. */
export interface MemberRecord extends SanththaMember {
  readonly hasPaid: boolean;
  readonly payment: SanththaPayment | null;
}

export interface SanththaSummary {
  readonly members: number;
  readonly paid: number;
  readonly unpaid: number;
  readonly collected: number;
  readonly outstanding: number;
}
