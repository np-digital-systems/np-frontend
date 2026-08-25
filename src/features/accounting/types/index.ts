/**
 * The accounting domain, shaped the way the API returns it.
 *
 * Amounts are numbers, dates are ISO `yyyy-mm-dd`, foreign keys are ids —
 * formatting and joining both happen at the edge, so swapping mock data for
 * a real service is a fetch change and nothing else.
 */

/* -------------------------------------------------------------------------
   Chart of accounts
   ------------------------------------------------------------------------- */

export type AccountType =
  | 'asset'
  | 'liability'
  | 'equity'
  | 'income'
  | 'expense';

/** `accounts` — the ledger heads every entry posts against. */
export interface Account {
  readonly id: number;
  /** Numeric code; the first digit is the account class. */
  readonly code: string;
  readonly name: string;
  readonly nameTa: string;
  readonly type: AccountType;
  /** Null for a top-level head. */
  readonly parentId: number | null;
  readonly isActive: boolean;
  /** Balance carried in from the previous year. Income and expense start at 0. */
  readonly openingBalance: number;
  readonly createdAt: string;
}

/**
 * The slice of an account that a *transaction* needs to name it.
 *
 * Joined records carry references, never the master row: a cashier reads the
 * ledger without holding `account:view`, and shipping the full row would put
 * every account's year balance in their payload — hiding it in the markup
 * would not take it back out again.
 */
export type AccountRef = Pick<
  Account,
  'id' | 'code' | 'name' | 'nameTa' | 'type'
>;

export interface AccountRecord extends Account {
  readonly parent: Account | null;
  /** Posted ledger entries against this account in the active year. */
  readonly entryCount: number;
  /**
   * Closing balance, derived rather than stored.
   *
   * Opening balance plus the year's postings, in the account's natural
   * direction — so the chart of accounts can never disagree with the ledger
   * that produced it.
   */
  readonly balance: number;
}

/* -------------------------------------------------------------------------
   Funds, projects, banks
   ------------------------------------------------------------------------- */

/** `funds` — the temple's earmarked pools of money. */
export interface Fund {
  readonly id: number;
  readonly name: string;
  readonly nameTa: string;
  readonly opening: number;
  readonly income: number;
  readonly expenses: number;
  readonly isActive: boolean;
}

/** The slice of a fund that names it on a joined record. */
export type FundRef = Pick<Fund, 'id' | 'name' | 'nameTa'>;

/** A fund's closing position is derived, never stored. */
export interface FundPosition extends Fund {
  readonly balance: number;
}

export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'on-hold'
  | 'completed';

/** `projects` — a thiruppani or a festival that money is tracked against. */
export interface Project {
  readonly id: number;
  readonly name: string;
  readonly nameTa: string;
  readonly fundId: number;
  /** Null when the work is open-ended and no ceiling was agreed. */
  readonly budget: number | null;
  readonly startDate: string;
  /** When the work is meant to be finished. Null for open-ended work. */
  readonly targetDate: string | null;
  readonly status: ProjectStatus;
  readonly description: string;
  /**
   * Whether a voucher may still be posted against it.
   *
   * Distinct from `status`: work that is on hold keeps its budget and its
   * history but stops accepting new entries, and completed work stays
   * readable long after the last payment.
   */
  readonly isActive: boolean;
}

/**
 * The slice of a project that names it on a joined record.
 *
 * `isActive` travels because a picker has to know what it may still offer;
 * the budget does not, because that is fund-management information.
 */
export type ProjectRef = Pick<Project, 'id' | 'name' | 'fundId' | 'isActive'>;

export type BankAccountType = 'current' | 'savings' | 'fixed-deposit';

/** `bank_accounts` — where the temple's money actually sits. */
export interface BankAccount {
  readonly id: number;
  readonly label: string;
  readonly bankName: string;
  readonly branch: string;
  /** Stored masked; the full number is never sent to the browser. */
  readonly accountNumber: string;
  readonly type: BankAccountType;
  readonly openingBalance: number;
  readonly isActive: boolean;
  readonly openedOn: string;
  /**
   * The asset account this bank account posts through.
   *
   * Every movement of bank money is a movement on this ledger head, which is
   * what lets the bank book be derived from the ledger rather than kept as a
   * parallel list that can drift out of step with it.
   */
  readonly ledgerAccountId: number;
}

/** A bank account with its balance derived from the ledger. */
export interface BankAccountRecord extends BankAccount {
  readonly balance: number;
}

/**
 * The slice of a bank account that names it on a voucher or in a picker.
 *
 * Balances and account numbers stay behind `bank-account:view`.
 */
export type BankAccountRef = Pick<
  BankAccount,
  'id' | 'label' | 'type' | 'isActive'
>;

/* -------------------------------------------------------------------------
   Vouchers
   ------------------------------------------------------------------------- */

export type VoucherKind = 'receipt' | 'payment';

/**
 * Where a voucher sits in the approval chain.
 *
 * Only `Posted` affects the ledger. Everything before it is a claim about
 * money, not a record of it — which is the single most important thing this
 * module has to keep legible.
 */
export type VoucherStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Posted'
  | 'Cancelled';

export type PaymentMode = 'cash' | 'bank' | 'cheque' | 'online';

/** Who acted on a voucher, denormalised so a list needs no user lookup. */
export interface VoucherActor {
  readonly id: string;
  readonly name: string;
}

/** `vouchers` — one receipt or payment, at whatever stage it has reached. */
export interface Voucher {
  readonly id: number;
  /** Human reference: `RV-2026-0125`, `PV-2026-0074`. */
  readonly ref: string;
  readonly kind: VoucherKind;
  readonly date: string;
  readonly description: string;
  readonly amount: number;

  readonly accountId: number;
  readonly fundId: number;
  readonly projectId: number | null;

  readonly mode: PaymentMode;
  /** Set when the mode moves money through a bank account. */
  readonly bankAccountId: number | null;
  readonly chequeNo: string | null;

  /** Payer for a receipt, payee for a payment. */
  readonly party: string;

  /** The temple event this money relates to, when there is one. */
  readonly eventRef: string | null;

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

/** A voucher with its foreign keys resolved to display references. */
export interface VoucherRecord extends Voucher {
  readonly account: AccountRef;
  readonly fund: FundRef;
  readonly project: ProjectRef | null;
  readonly bankAccount: BankAccountRef | null;
}

/* -------------------------------------------------------------------------
   Ledger
   ------------------------------------------------------------------------- */

/**
 * `ledger_entries` — the posted double-entry lines.
 *
 * Derived from vouchers that reached `Posted`; nothing writes here directly.
 */
export interface LedgerEntry {
  readonly id: number;
  /** The voucher both legs of this entry came from. */
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

/** A cash- or bank-book line, with the balance it left behind. */
export interface BookRow extends LedgerRecord {
  /** Money in for this book — receipts, or deposits. */
  readonly inflow: number;
  /** Money out — payments, or withdrawals. */
  readonly outflow: number;
  /** Running balance after this row. */
  readonly balance: number;
  readonly chequeNo: string | null;
}

export interface BookSummary {
  readonly opening: number;
  readonly inflow: number;
  readonly outflow: number;
  readonly closing: number;
}

/* -------------------------------------------------------------------------
   Summaries
   ------------------------------------------------------------------------- */

export interface AccountingSummary {
  readonly income: number;
  readonly expenses: number;
  readonly surplus: number;
  readonly cashBalance: number;
  readonly bankBalance: number;
  readonly pendingApprovals: number;
  readonly pendingAmount: number;
}

/** One line of an income & expenditure statement. */
export interface StatementLine {
  readonly account: AccountRef;
  readonly amount: number;
  /** Share of its side of the statement, for the inline bar. */
  readonly share: number;
}

export interface IncomeStatement {
  readonly income: readonly StatementLine[];
  readonly expenses: readonly StatementLine[];
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly surplus: number;
}

/** A row of the trial balance. */
export interface TrialBalanceRow {
  readonly account: AccountRef;
  readonly debit: number;
  readonly credit: number;
}
