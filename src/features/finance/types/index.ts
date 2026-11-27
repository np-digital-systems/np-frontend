import type {
  Fund,
  LedgerRecord,
  Project,
  ProjectStatus,
  VoucherStatus,
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

export type DepositPurpose = 'general' | 'pooja';

/** Decides the entry that put the principal on the books; `opening` deposits needed none. */
export type DepositSource = 'bank' | 'endowment' | 'renewal' | 'opening';

export interface DepositVoucherRef {
  readonly id: number;
  readonly ref: string;
  readonly status: string;
}

export interface FixedDeposit {
  readonly id: number;
  readonly certificateNo: string;
  /** Null on deposits recorded before names were kept. */
  readonly name: string | null;
  readonly bankName: string;
  readonly branch: string;
  readonly principal: number;
    readonly interestRate: number;
  readonly placedOn: string;
  readonly maturesOn: string;
  readonly tenureMonths: number;
  readonly interestPayout: InterestPayout;
    readonly fundId: number;
  readonly purpose: DepositPurpose;
  /** Set only for a pooja deposit. */
  readonly slotId: number | null;
  readonly bankAccountId: number | null;
  readonly source: DepositSource;
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
  readonly poojaName: string | null;
  readonly interestReceived: number;
  readonly placementVoucher: DepositVoucherRef | null;
  readonly closureVoucher: DepositVoucherRef | null;
  /** Posted principal on the deposit head; differs from the register until vouchers post. */
  readonly bookBalance: number;
  readonly bookDifference: number;
}

export type DepositVoucherRole = 'placement' | 'interest' | 'renewal' | 'closure' | 'other';

/** A voucher raised for a deposit or another certificate in its renewal chain. */
export interface DepositVoucher {
  readonly id: number;
  readonly ref: string;
  readonly kind: 'receipt' | 'payment' | 'contra' | 'journal';
  readonly date: string;
  readonly manualVoucherNo: string | null;
  readonly description: string;
  readonly party: string;
  readonly amount: number;
  readonly status: VoucherStatus;
  readonly certificateNo: string;
  readonly role: DepositVoucherRole;
}

export interface SlotOption {
  readonly id: number;
  readonly poojaName: string;
  readonly poojaTypeId: number;
  readonly poojaTypeName: string;
  /** Null when the pooja type has a single slot. */
  readonly slotName: string | null;
  readonly sponsorName: string | null;
}

export interface DepositInterest {
  readonly depositId: number;
  readonly certificates: readonly string[];
  readonly years: readonly {
    readonly financialYearId: number;
    readonly label: string;
    readonly amount: number;
  }[];
  readonly total: number;
}

export interface PoojaFundingRow {
  readonly slotId: number | null;
  readonly poojaName: string | null;
  readonly sponsorName: string | null;
  readonly deposits: number;
  readonly principal: number;
  readonly interestReceived: number;
  readonly sponsorTopUps: number;
  readonly spent: number;
  /** Positive is surplus, negative a shortfall. */
  readonly balance: number;
}

export interface PoojaFunding {
  readonly financialYearId: number;
  readonly financialYearLabel: string;
  readonly rows: readonly PoojaFundingRow[];
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
