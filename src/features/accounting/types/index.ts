

export type AccountType =
  | 'asset'
  | 'liability'
  | 'equity'
  | 'income'
  | 'expense';

export interface Account {
  readonly id: number;
    readonly code: string;
  readonly name: string;
  readonly nameTa: string;
  readonly type: AccountType;
    readonly parentId: number | null;
  readonly isActive: boolean;
    readonly openingBalance: number;
  readonly createdAt: string;
}

export type AccountRef = Pick<Account, 'id' | 'code' | 'name' | 'nameTa' | 'type'>;

export interface AccountRecord extends Account {
  readonly parent: Account | null;
    readonly entryCount: number;
    readonly balance: number;
}

export interface Fund {
  readonly id: number;
  readonly name: string;
  readonly nameTa: string;
  readonly opening: number;
  readonly income: number;
  readonly expenses: number;
  readonly isActive: boolean;
}

export type FundRef = Pick<Fund, 'id' | 'name' | 'nameTa'>;

export interface FundPosition extends Fund {
  readonly balance: number;
}

export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'on-hold'
  | 'completed';

export interface Project {
  readonly id: number;
  readonly name: string;
  readonly nameTa: string;
  readonly fundId: number;
    readonly budget: number | null;
  readonly startDate: string;
    readonly targetDate: string | null;
  readonly status: ProjectStatus;
  readonly description: string;
    readonly isActive: boolean;
}

export type ProjectRef = Pick<Project, 'id' | 'name' | 'fundId' | 'isActive'>;

export type BankAccountType = 'current' | 'savings' | 'fixed-deposit';

export interface BankAccount {
  readonly id: number;
  readonly label: string;
  readonly bankName: string;
  readonly branch: string;
    readonly accountNumber: string;
  readonly type: BankAccountType;
  readonly openingBalance: number;
  readonly isActive: boolean;
  readonly openedOn: string;
    readonly ledgerAccountId: number;
}

export interface BankAccountRecord extends BankAccount {
  readonly balance: number;
}

export type BankAccountRef = Pick<
  BankAccount,
  'id' | 'label' | 'type' | 'isActive'
>;

export type VoucherKind = 'receipt' | 'payment';

export type VoucherStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Posted'
  | 'Cancelled';

export type PaymentMode = 'cash' | 'bank' | 'cheque' | 'online';

export interface VoucherActor {
  readonly id: string;
  readonly name: string;
}

/**
 * One head a voucher is coded to.
 *
 * No debit or credit column: every line of a receipt credits income and every
 * line of a payment debits expenditure, which follows from the voucher's kind.
 * The contra against cash or bank is generated when the voucher is posted.
 */
export interface VoucherLine {
  readonly id: number;
  readonly lineNo: number;
  readonly accountId: number;
  readonly amount: number;
  readonly fundId: number;
  readonly projectId: number | null;
  readonly activityId: number | null;
  /** The occurrence this line is for — which Friday, not merely a Friday. */
  readonly eventId: number | null;
  readonly account: AccountRef;
  readonly fund: FundRef;
  readonly project: ProjectRef | null;
}

export interface Voucher {
  readonly id: number;
    readonly ref: string;
  readonly kind: VoucherKind;
  readonly date: string;
  readonly description: string;
  readonly amount: number;

  /** The heads this voucher is coded to. Always at least one. */
  readonly lines: readonly VoucherLine[];

  /** Who the entry was with — one payer per document, however it splits. */
  readonly partyId: number | null;

  readonly mode: PaymentMode;
    readonly bankAccountId: number | null;
  readonly chequeNo: string | null;

    readonly party: string;

    /** Number written on the temple's physical voucher book. */
    readonly manualVoucherNo: string | null;


  readonly status: VoucherStatus;
  readonly notes: string | null;

  readonly createdBy: VoucherActor;
  readonly createdAt: string;
  readonly submittedAt: string | null;
  readonly decidedBy: VoucherActor | null;
  readonly decidedAt: string | null;
  readonly rejectionReason: string | null;
  readonly postedAt: string | null;
}

export interface VoucherRecord extends Voucher {
  readonly bankAccount: BankAccountRef | null;
}

export interface LedgerEntry {
  readonly id: number;
    readonly voucherId: number;
  readonly date: string;
  readonly ref: string;
  readonly description: string;
  readonly accountId: number;
  readonly fundId: number;
  readonly projectId: number | null;
  readonly debit: number | null;
  readonly credit: number | null;
  readonly mode: PaymentMode;
  readonly bankAccountId: number | null;
  readonly status: VoucherStatus;
}

export interface LedgerRecord extends LedgerEntry {
  readonly account: AccountRef;
  readonly fund: FundRef;
  readonly project: ProjectRef | null;
}

export interface BookRow extends LedgerRecord {
    readonly inflow: number;
    readonly outflow: number;
    readonly balance: number;
  readonly chequeNo: string | null;
}

export interface BookSummary {
  readonly opening: number;
  readonly inflow: number;
  readonly outflow: number;
  readonly closing: number;
}

/** A pooja category — an event type, as the voucher form needs it. */
export interface PoojaTypeRef {
  readonly id: number;
  readonly name: string;
  readonly nameEn: string;
  /** The activity a receipt for this pooja is coded to; it carries the fund. */
  readonly activityId: number | null;
}

export type ActivityKind = 'pooja' | 'service' | 'facility' | 'general';

/**
 * What an entry was for.
 *
 * The one dimension that sits on both sides of the books, so a pooja can be
 * read whole — sponsorship in against the priest time it cost.
 */
export interface Activity {
  readonly id: number;
  readonly name: string;
  readonly nameEn: string;
  readonly kind: ActivityKind;
  readonly defaultFundId: number | null;
  readonly defaultProjectId: number | null;
  readonly defaultPartyId: number | null;
  readonly isActive: boolean;
}

export interface ActivityRecord extends Activity {
  readonly entryCount: number;
  readonly income: number;
  readonly expenses: number;
  readonly net: number;
}

export type ActivityRef = Pick<
  Activity,
  | 'id'
  | 'name'
  | 'nameEn'
  | 'kind'
  | 'defaultFundId'
  | 'defaultProjectId'
  | 'defaultPartyId'
>;

export type PartyKind = 'sponsor' | 'staff' | 'vendor' | 'devotee';

/**
 * Who an entry was with.
 *
 * The subsidiary ledger: people never become heads in the chart of accounts,
 * so one salaries head serves every kurukkal and the question "what did we pay
 * him" is answered by grouping on this instead.
 */
export interface Party {
  readonly id: number;
  readonly name: string;
  readonly nameEn: string;
  readonly kind: PartyKind;
  readonly userId: string | null;
  readonly phone: string | null;
  readonly isActive: boolean;
}

export interface PartyRecord extends Party {
  readonly entryCount: number;
  readonly contributed: number;
  readonly paid: number;
}

export type PartyRef = Pick<Party, 'id' | 'name' | 'nameEn' | 'kind' | 'userId'>;

/** One dated pooja, with whoever sponsors it. */
export interface PoojaRef {
  readonly id: number;
  readonly eventTypeId: number;
  /** The activity this pooja's type is coded to; the picker filters on it. */
  readonly activityId: number | null;
  readonly label: string;
  readonly date: string;
  readonly sponsorName: string | null;
  /** The person behind the sponsorship, so their party can be found. */
  readonly sponsorId: string | null;
}

export interface AccountingSummary {
  readonly income: number;
  readonly expenses: number;
  readonly surplus: number;
  readonly cashBalance: number;
  readonly bankBalance: number;
  readonly pendingApprovals: number;
  readonly pendingAmount: number;
}

export interface StatementLine {
  readonly account: AccountRef;
  readonly amount: number;
    readonly share: number;
}

export interface IncomeStatement {
  readonly income: readonly StatementLine[];
  readonly expenses: readonly StatementLine[];
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly surplus: number;
}

export interface TrialBalanceRow {
  readonly account: AccountRef;
  readonly debit: number;
  readonly credit: number;
}
