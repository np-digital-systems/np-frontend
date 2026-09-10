import type { AccountRef } from '@/features/accounting/types';

/**
 * The head a line posts to, as the costing endpoints actually send it.
 *
 * Narrower than `AccountRef` on purpose: that type carries `defaultPartyId`,
 * which the API's account ref does not include. Widening it here would be a
 * promise about a field that arrives undefined.
 */
export type CostingAccount = Pick<
  AccountRef,
  'id' | 'code' | 'name' | 'nameTa' | 'type'
>;

/** One item under a heading — what the quote shows a family. */
export interface CostingItem {
  readonly id: number;
  readonly lineNo: number;
  readonly label: string;
  readonly quantity: number;
  readonly unitAmount: number;
  /** Quantity times the unit price. Never typed. */
  readonly amount: number;
}

/** One heading — the level that reaches the ledger. */
export interface CostingLine {
  readonly id: number;
  readonly lineNo: number;
  readonly label: string | null;
  readonly accountId: number;
  readonly account: CostingAccount;
  readonly fundId: number;
  readonly activityId: number | null;
  readonly partyId: number | null;
  readonly partyName: string | null;
  readonly amount: number;
  readonly chargedToSponsor: boolean;
  readonly items: readonly CostingItem[];
}

export interface CostingRecord {
  readonly id: number;
  readonly eventTypeId: number;
  readonly eventTypeName: string;
  /** Null covers every instance of the type. */
  readonly slotId: number | null;
  readonly slotLabel: string | null;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
  /** Nothing switches a costing on: the one still open is the one in force. */
  readonly isInForce: boolean;
  /** The lines charged to the sponsor, added up. */
  readonly sponsorAmount: number;
  readonly incomeAccountId: number | null;
  readonly incomeAccountName: string | null;
  readonly incomeFundId: number | null;
  /** Why a receipt cannot be raised for this pooja yet, or null. */
  readonly codingProblem: string | null;
  readonly notes: string | null;
  readonly lines: readonly CostingLine[];
  readonly expenseTotal: number;
  readonly chargedTotal: number;
  /** Quote less what the sponsor carries. Negative means a shortfall. */
  readonly templeShare: number;
  /** Above zero and the version is history: it can no longer be revised. */
  readonly usedByEvents: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** The one-line answer before a day is costed. */
export interface CostingSummary {
  readonly costingId: number | null;
  readonly sponsorAmount: number | null;
  readonly expenseTotal: number | null;
  readonly problem: string | null;
}

export type BudgetLineStatus = 'Not raised' | 'In progress' | 'Posted';

export interface BudgetLine {
  readonly id: string;
  readonly lineNo: number;
  readonly label: string;
  readonly accountId: number;
  readonly account: CostingAccount;
  readonly fundId: number;
  readonly activityId: number | null;
  readonly partyId: number | null;
  readonly partyName: string | null;
  readonly budgeted: number;
  readonly actual: number;
  /** Actual less budgeted. Positive is an overspend. */
  readonly variance: number;
  readonly chargedToSponsor: boolean;
  readonly status: BudgetLineStatus;
}

export interface EventBudget {
  readonly eventId: number;
  readonly costingId: number | null;
  readonly sponsorAmount: number | null;
  readonly sponsorReceived: number | null;
  readonly lines: readonly BudgetLine[];
  readonly budgetedTotal: number;
  readonly actualTotal: number;
  readonly variance: number;
  /** The day has been kept; the budget is what it was quoted at. */
  readonly isFrozen: boolean;
  readonly problem: string | null;
}

/**
 * What is written, as opposed to what is read back.
 *
 * No fund and no activity: both come from the pooja type's own activity, which
 * already answers them for every receipt the temple raises.
 */
export interface CostingItemDraft {
  label: string;
  quantity: number;
  unitAmount: number;
}

export interface CostingLineDraft {
  accountId: number;
  partyId: number | null;
  label: string | null;
  /** Ignored where there are items: the items decide the figure. */
  amount: number;
  chargedToSponsor: boolean;
  items: CostingItemDraft[];
}
