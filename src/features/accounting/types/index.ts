

export type AccountType =
  | 'asset'
  | 'liability'
  | 'equity'
  | 'income'
  | 'expense';

/** Cash and bank heads only move through a voucher's cash/bank side or a contra. */
export type MoneyHead = 'cash' | 'bank';

export interface Account {
  readonly id: number;
    readonly code: string;
  readonly name: string;
  readonly nameTa: string;
  readonly type: AccountType;
    readonly parentId: number | null;
  /** False for grouping heads, which only total their children. */
  readonly isPostable: boolean;
  readonly isActive: boolean;
    readonly openingBalance: number;
  /** Only for heads paid to a single party (e.g. electricity), never shared heads like salaries. */
  readonly defaultPartyId: number | null;
  readonly createdAt: string;
  readonly moneyHead: MoneyHead | null;
}

export type AccountRef = Pick<
  Account,
  'id' | 'code' | 'name' | 'nameTa' | 'type' | 'defaultPartyId' | 'moneyHead'
>;

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

/** A contra moves money between the temple's own cash and bank; a journal moves none. */
export type VoucherKind = 'receipt' | 'payment' | 'contra' | 'journal';

export type EntrySide = 'debit' | 'credit';

/** Cash, or one bank account, with the ledger head its money sits on; what a contra moves between. */
export interface MoneyAccount {
  readonly key: string;
  readonly label: string;
  readonly accountId: number;
  /** Null for cash. */
  readonly bankAccountId: number | null;
}

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

// Only journal lines carry a side; on every other kind it follows from the kind, and the cash/bank side
// is generated on posting. A contra's one line is the cash or bank head the money went to.
export interface VoucherLine {
  readonly id: number;
  readonly lineNo: number;
  readonly accountId: number;
  readonly amount: number;
  readonly fundId: number;
  readonly projectId: number | null;
  readonly activityId: number | null;
  /** The specific pooja occurrence, if any. */
  readonly eventId: number | null;
  /** Set on lines raised from a fixed deposit: its principal or its interest. */
  readonly fixedDepositId: number | null;
  readonly side: EntrySide | null;
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

  /** Always at least one. */
  readonly lines: readonly VoucherLine[];

  readonly partyId: number | null;

  /** Null for a journal. */
  readonly mode: PaymentMode | null;
    readonly bankAccountId: number | null;
  readonly chequeNo: string | null;

    readonly party: string;

    /** Number from the temple's physical voucher book. */
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
  readonly mode: PaymentMode | null;
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

export interface PoojaTypeRef {
  readonly id: number;
  readonly name: string;
  readonly nameEn: string;
  /** Receipts are coded to this activity, which carries the fund. */
  readonly activityId: number | null;
}

export type ActivityKind = 'pooja' | 'service' | 'facility' | 'general';

// Used on both income and expense, so a pooja's income and costs can be reported together.
export interface Activity {
  readonly id: number;
  readonly name: string;
  readonly nameEn: string;
  readonly kind: ActivityKind;
  readonly defaultFundId: number | null;
  readonly defaultProjectId: number | null;
  readonly defaultPartyId: number | null;
  /** One default head; its account type decides whether it applies to receipts or payments. */
  readonly defaultAccountId: number | null;
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
  | 'defaultAccountId'
>;

export type PartyKind = 'devotee' | 'vendor' | 'staff';

export type PartyType = 'person' | 'organisation';

// Subsidiary ledger: people are never heads in the chart of accounts; reports group by party instead.
export interface Party {
  readonly id: number;
  readonly type: PartyType;
  readonly name: string;
  readonly nameEn: string;
  /** A party can hold several roles; roles only group lists, the account decides meaning. */
  readonly roles: readonly PartyKind[];
  /** Sponsorship is a profile, not a role. */
  readonly isSponsor: boolean;
  readonly accountId: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  /** Their account number with us, or ours with them. */
  readonly referenceNo: string | null;
  readonly notes: string | null;
  readonly isActive: boolean;
}

export interface PartyRecord extends Party {
  readonly entryCount: number;
  readonly contributed: number;
  readonly paid: number;
}

export type PartyRef = Pick<
  Party,
  'id' | 'type' | 'name' | 'nameEn' | 'roles' | 'isSponsor'
>;

export interface PoojaRef {
  readonly id: number;
  readonly eventTypeId: number;
  readonly activityId: number | null;
  readonly label: string;
  readonly date: string;
  readonly sponsorName: string | null;
  /** Receipts for this pooja are collected from this party. */
  readonly sponsorPartyId: number | null;
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

export interface BalanceLine {
  readonly account: Pick<AccountRef, 'id' | 'code' | 'name' | 'type'>;
  readonly amount: number;
}

/** Cumulative to the end of the financial year, not one year's movement. */
export interface BalanceSheet {
  readonly asOf: string;
  readonly financialYearLabel: string;
  readonly assets: readonly BalanceLine[];
  readonly liabilities: readonly BalanceLine[];
  readonly equity: readonly BalanceLine[];
  readonly accumulatedSurplus: number;
  readonly totalAssets: number;
  readonly totalLiabilitiesAndEquity: number;
  /** Opening balances entered on one side only; explains any gap between the totals. */
  readonly openingDifference: number;
  readonly balanced: boolean;
}

export interface TrialBalanceRow {
  readonly account: AccountRef;
  readonly debit: number;
  readonly credit: number;
}
