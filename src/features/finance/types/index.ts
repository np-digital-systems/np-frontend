import type {
  Fund,
  LedgerRecord,
  Project,
  ProjectStatus,
} from '@/features/accounting/types';

export type { Fund, Project, ProjectStatus };

export interface FundRecord extends Fund {
    readonly balance: number;
    readonly utilisation: number;
  readonly projectCount: number;
    readonly committed: number;
  readonly entryCount: number;
}

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

export interface ProjectRecord extends Project {
  readonly fundName: string;
  readonly spent: number;
  readonly received: number;
    readonly remaining: number | null;
    readonly utilisation: number | null;
  readonly isOverBudget: boolean;
  readonly entryCount: number;
}

export type DepositStatus = 'active' | 'matured' | 'renewed' | 'closed';

export type InterestPayout = 'monthly' | 'quarterly' | 'on-maturity';

export interface FixedDeposit {
  readonly id: number;
  readonly certificateNo: string;
  readonly bankName: string;
  readonly branch: string;
  readonly principal: number;
    readonly interestRate: number;
  readonly placedOn: string;
  readonly maturesOn: string;
  readonly tenureMonths: number;
  readonly interestPayout: InterestPayout;
    readonly fundId: number;
  readonly status: DepositStatus;
    readonly renewedFromId: number | null;
  readonly notes: string | null;
}

export interface DepositRecord extends FixedDeposit {
  readonly fundName: string;
    readonly interestOnMaturity: number;
  readonly maturityValue: number;
    readonly interestAccrued: number;
    readonly daysToMaturity: number;
    readonly isMaturingSoon: boolean;
  readonly isOverdue: boolean;
}

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

export interface Asset {
  readonly id: number;
    readonly tag: string;
  readonly name: string;
  readonly nameTa: string;
  readonly category: AssetCategory;
  readonly acquiredOn: string;
  readonly cost: number;
    readonly depreciationRate: number;
  readonly location: string;
  readonly condition: AssetCondition;
  readonly status: AssetStatus;
  readonly fundId: number;
  readonly disposedOn: string | null;
  readonly disposalValue: number | null;
  readonly notes: string | null;
}

export interface AssetRecord extends Asset {
  readonly fundName: string;
  readonly ageYears: number;
  readonly accumulatedDepreciation: number;
    readonly netBookValue: number;
  readonly annualDepreciation: number;
}

export interface AssetCategoryTotal {
  readonly category: AssetCategory;
  readonly count: number;
  readonly cost: number;
  readonly netBookValue: number;
}

export interface FinanceSummary {
  readonly fundBalance: number;
  readonly depositPrincipal: number;
  readonly depositMaturityValue: number;
  readonly assetCost: number;
  readonly assetNetBookValue: number;
}
