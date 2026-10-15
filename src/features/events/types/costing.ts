import type { AccountRef } from '@/features/accounting/types';

// Narrower than AccountRef: the costing endpoints don't send defaultPartyId.
export type CostingAccount = Pick<
  AccountRef,
  'id' | 'code' | 'name' | 'nameTa' | 'type'
>;

export interface CostingItem {
  readonly id: number;
  readonly lineNo: number;
  readonly label: string;
  readonly amount: number;
}

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
  /** Sum of `items` when there are any. */
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
  /** ISO timestamp. Null on the first version, which has always applied. */
  readonly effectiveFrom: string | null;
  /** Null while still in force. */
  readonly effectiveTo: string | null;
  /** Null while a draft. */
  readonly versionNo: number | null;
  readonly status: CostingStatus;
  readonly isDraft: boolean;
  readonly isInForce: boolean;
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
  /** Quote less the sponsor's share. Negative means a shortfall. */
  readonly templeShare: number;
  /** Above zero means the version can no longer be revised. */
  readonly usedByEvents: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

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
  /** The day has been held; the budget is fixed at what was quoted. */
  readonly isFrozen: boolean;
  readonly problem: string | null;
}

// Fund and activity are omitted: both come from the pooja type's activity.
export interface CostingItemDraft {
  label: string;
  amount: number;
}

export interface CostingLineDraft {
  accountId: number;
  partyId: number | null;
  label: string | null;
  /** Ignored when there are items. */
  amount: number;
  chargedToSponsor: boolean;
  items: CostingItemDraft[];
}

// Matches the API's casing so no mapping layer is needed.
export type CostingStatus = 'draft' | 'inForce' | 'superseded';

export interface ExpectedLine {
  readonly accountId: number;
  readonly label: string;
  readonly amount: number;
}

export interface ExpectedAmounts {
  /** True when figures come from the day's frozen budget rather than the current costing. */
  readonly costed: boolean;
  readonly sponsorAmount: number | null;
  readonly lines: readonly ExpectedLine[];
}
