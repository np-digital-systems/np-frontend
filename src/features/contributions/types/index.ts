import type { BadgeStatus } from '@/components/portal/ui';

// Sanththa: the yearly membership subscription, one flat rate per member per year.

// Keyed by party id; name and contact details belong to the party.
export interface SanththaMember {
  readonly id: string;
  readonly memberNo: string;
  readonly fullName: string;
  readonly nameTa: string;
  readonly phone: string;
  readonly address: string;
  readonly joinedOn: string;
  /** Whether sanththa is due. Exempt sponsors can still be active. */
  readonly subscribes: boolean;
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
  readonly receiptRef: string | null;
  /** Voucher status, so StatusBadge renders it directly. Null when no receipt is linked. */
  readonly receiptStatus: BadgeStatus | null;
  /** Number from the paper receipt book. */
  readonly manualVoucherNo: string | null;
  /** Set by the server; false once the receipt is approved or posted. */
  readonly editable: boolean;
  readonly mode: PaymentMode;
  readonly collectedBy: string;
}

export interface MemberRecord extends SanththaMember {
  readonly hasPaid: boolean;
  readonly payment: SanththaPayment | null;
}

export interface SanththaSummary {
  /** Null until a rate is set for the year. */
  readonly rate: number | null;
  readonly members: number;
  readonly subscribing: number;
  readonly paid: number;
  readonly unpaid: number;
  readonly collected: number;
  readonly outstanding: number;
}

// Keyed by party id; editing name or contact details here edits the party too.
export interface SponsorRecord {
  readonly partyId: number;
  readonly sponsorNo: string;
  readonly name: string;
  readonly nameEn: string;
  readonly phone: string;
  readonly email: string;
  readonly address: string;
  readonly sponsorSince: string;
  readonly subscribes: boolean;
  readonly isActive: boolean;
  readonly notes: string | null;
  readonly sponsorships: number;
  readonly paidYears: readonly number[];
  readonly totalPaid: number;
  readonly paidThisYear: boolean;
}

export type ContributorReason = 'gave-before' | 'sponsor' | 'vendor' | 'devotee';

export interface Contributor {
  readonly partyId: number;
  readonly name: string;
  readonly nameEn: string;
  readonly phone: string;
  readonly reason: ContributorReason;
  readonly lastAmount: number | null;
  readonly lastYear: number | null;
  readonly paidThisTime: boolean;
  readonly paidAmount: number | null;
}

export interface CollectionEvent {
  readonly id: number;
  readonly scheduledDate: string;
  readonly instanceLabel: string;
  readonly eventTypeName: string;
  readonly isGeneral: boolean;
  readonly activityId: number | null;
}

// Gate on `configured`: a head can be set but unusable if its activity has no fund. `problem` says why.
export interface SanththaPosting {
  readonly configured: boolean;
  readonly accountCode: string | null;
  readonly accountName: string | null;
  readonly fundName: string | null;
  readonly activityName: string | null;
  readonly problem: string | null;
}
