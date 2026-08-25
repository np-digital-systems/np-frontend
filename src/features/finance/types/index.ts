import type {
  Fund,
  LedgerRecord,
  Project,
  ProjectStatus,
} from '@/features/accounting/types';

/**
 * The financial management domain.
 *
 * Funds and projects are accounting masters — the ledger posts against them —
 * so they are consumed from that module rather than redefined here. Fixed
 * deposits and assets belong to this one: nothing posts *against* them, they
 * are things the temple holds.
 */

export type { Fund, Project, ProjectStatus };

/* -------------------------------------------------------------------------
   Funds
   ------------------------------------------------------------------------- */

/** A fund with the year's movement resolved and its position derived. */
export interface FundRecord extends Fund {
  /** Opening plus income less expenditure. Never stored. */
  readonly balance: number;
  /** Share of what was available that has been spent. */
  readonly utilisation: number;
  readonly projectCount: number;
  /** Budget committed to this fund's projects, whether spent yet or not. */
  readonly committed: number;
  readonly entryCount: number;
}

/** One income or expenditure head as it bears on a single fund. */
export interface FundBreakdownLine {
  readonly accountId: number;
  readonly accountName: string;
  readonly amount: number;
  readonly share: number;
}

export interface FundDetail {
  readonly fund: FundRecord;
  readonly income: readonly FundBreakdownLine[];
  readonly expenses: readonly FundBreakdownLine[];
  readonly recent: readonly LedgerRecord[];
}

/* -------------------------------------------------------------------------
   Projects
   ------------------------------------------------------------------------- */

/** A project with its spend read off the ledger rather than stored. */
export interface ProjectRecord extends Project {
  readonly fundName: string;
  readonly spent: number;
  readonly received: number;
  /** Budget less spend. Null when the project has no agreed ceiling. */
  readonly remaining: number | null;
  /** Share of the budget consumed. Null without a budget to measure against. */
  readonly utilisation: number | null;
  readonly isOverBudget: boolean;
  readonly entryCount: number;
}

/* -------------------------------------------------------------------------
   Fixed deposits
   ------------------------------------------------------------------------- */

export type DepositStatus = 'active' | 'matured' | 'renewed' | 'closed';

export type InterestPayout = 'monthly' | 'quarterly' | 'on-maturity';

/** `fixed_deposits` — temple money placed with a bank for a fixed term. */
export interface FixedDeposit {
  readonly id: number;
  readonly certificateNo: string;
  readonly bankName: string;
  readonly branch: string;
  readonly principal: number;
  /** Annual rate as a percentage, e.g. `12.5`. */
  readonly interestRate: number;
  readonly placedOn: string;
  readonly maturesOn: string;
  readonly tenureMonths: number;
  readonly interestPayout: InterestPayout;
  /** The fund whose money was placed. */
  readonly fundId: number;
  readonly status: DepositStatus;
  /** Set when this deposit is the renewal of an earlier one. */
  readonly renewedFromId: number | null;
  readonly notes: string | null;
}

/** A deposit with its interest and maturity worked out. */
export interface DepositRecord extends FixedDeposit {
  readonly fundName: string;
  /** Simple interest over the full term. */
  readonly interestOnMaturity: number;
  readonly maturityValue: number;
  /** Interest accrued from placement to today. */
  readonly interestAccrued: number;
  /** Negative once a deposit is past its maturity date. */
  readonly daysToMaturity: number;
  /** Within the alert window and still active. */
  readonly isMaturingSoon: boolean;
  readonly isOverdue: boolean;
}

/* -------------------------------------------------------------------------
   Assets
   ------------------------------------------------------------------------- */

export type AssetCategory =
  | 'land-building'
  | 'jewellery'
  | 'vahanam'
  | 'vessels'
  | 'furniture'
  | 'equipment'
  | 'vehicle';

export type AssetCondition = 'good' | 'fair' | 'needs-repair' | 'unusable';

export type AssetStatus =
  | 'in-use'
  | 'in-storage'
  | 'under-repair'
  | 'disposed';

/** `assets` — the register of what the temple owns. */
export interface Asset {
  readonly id: number;
  /** Physical tag written on the item or its case. */
  readonly tag: string;
  readonly name: string;
  readonly nameTa: string;
  readonly category: AssetCategory;
  readonly acquiredOn: string;
  readonly cost: number;
  /**
   * Straight-line annual depreciation, as a percentage of cost.
   *
   * Zero for things that do not depreciate — land, and gold and silver
   * articles, which a temple carries at cost.
   */
  readonly depreciationRate: number;
  readonly location: string;
  readonly condition: AssetCondition;
  readonly status: AssetStatus;
  readonly fundId: number;
  readonly disposedOn: string | null;
  readonly disposalValue: number | null;
  readonly notes: string | null;
}

/** An asset with its depreciation and book value worked out. */
export interface AssetRecord extends Asset {
  readonly fundName: string;
  readonly ageYears: number;
  readonly accumulatedDepreciation: number;
  /** Cost less accumulated depreciation, never below zero. */
  readonly netBookValue: number;
  readonly annualDepreciation: number;
}

export interface AssetCategoryTotal {
  readonly category: AssetCategory;
  readonly count: number;
  readonly cost: number;
  readonly netBookValue: number;
}

/* -------------------------------------------------------------------------
   Summaries
   ------------------------------------------------------------------------- */

export interface FinanceSummary {
  readonly fundBalance: number;
  readonly depositPrincipal: number;
  readonly depositMaturityValue: number;
  readonly assetCost: number;
  readonly assetNetBookValue: number;
}
