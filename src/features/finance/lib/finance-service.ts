import {
  getFunds,
  getLedger,
  getProjects,
} from '@/features/accounting/lib/accounting-service';
import type { Fund, LedgerRecord } from '@/features/accounting/types';
import { getToday } from '@/lib/format';

import { ASSETS, FIXED_DEPOSITS } from '../constants/mock-data';
import type {
  Asset,
  AssetCategory,
  AssetCategoryTotal,
  AssetRecord,
  DepositRecord,
  FinanceSummary,
  FixedDeposit,
  FundBreakdownLine,
  FundDetail,
  FundRecord,
  ProjectRecord,
} from '../types';

import {
  MATURITY_ALERT_DAYS,
  accumulatedDepreciation,
  daysBetween,
  share,
  simpleInterest,
  yearsBetween,
} from './finance-data';

/**
 * The read layer for financial management.
 *
 * Funds and projects come from the accounting module — the ledger owns them —
 * and everything this module *adds* is derived here: a fund's utilisation, a
 * project's spend, a deposit's accrued interest, an asset's book value. None
 * of it is stored, so none of it can be stale.
 *
 * TODO: replace the module-level constants with calls to the finance API.
 */

function fundName(funds: readonly Fund[], fundId: number): string {
  return funds.find((fund) => fund.id === fundId)?.name ?? 'Unassigned';
}

/* -------------------------------------------------------------------------
   Funds
   ------------------------------------------------------------------------- */

export function getFundRecords(): readonly FundRecord[] {
  const projects = getProjects();
  const ledger = getLedger();

  return getFunds().map((fund) => {
    const available = fund.opening + fund.income;
    const fundProjects = projects.filter(
      (project) => project.fundId === fund.id,
    );

    return {
      ...fund,
      balance: available - fund.expenses,
      utilisation: share(fund.expenses, available),
      projectCount: fundProjects.length,
      committed: fundProjects.reduce(
        (sum, project) => sum + (project.budget ?? 0),
        0,
      ),
      // Two ledger legs per voucher, and both carry the fund — so the count
      // is halved to report vouchers rather than lines.
      entryCount:
        ledger.filter((entry) => entry.fundId === fund.id).length / 2,
    };
  });
}

function breakdown(
  entries: readonly LedgerRecord[],
  type: 'income' | 'expense',
): readonly FundBreakdownLine[] {
  const side = type === 'income' ? 'credit' : 'debit';
  const totals = new Map<number, { name: string; amount: number }>();

  for (const entry of entries) {
    if (entry.account.type !== type) continue;

    const amount = entry[side] ?? 0;
    if (amount === 0) continue;

    const current = totals.get(entry.accountId);

    totals.set(entry.accountId, {
      name: entry.account.name,
      amount: (current?.amount ?? 0) + amount,
    });
  }

  const total = [...totals.values()].reduce((sum, line) => sum + line.amount, 0);

  return [...totals.entries()]
    .map(([accountId, line]) => ({
      accountId,
      accountName: line.name,
      amount: line.amount,
      share: share(line.amount, total),
    }))
    .sort((a, b) => b.amount - a.amount);
}

/** One fund, with what it took in and paid out broken down by head. */
export function getFundDetail(fundId: number): FundDetail | null {
  const fund = getFundRecords().find((entry) => entry.id === fundId);

  if (!fund) return null;

  const entries = getLedger().filter((entry) => entry.fundId === fundId);

  return {
    fund,
    income: breakdown(entries, 'income'),
    expenses: breakdown(entries, 'expense'),
    // The money legs would repeat every row against cash or bank, so only
    // the head legs are shown — one line per voucher, which is what reads.
    recent: entries
      .filter(
        (entry) =>
          entry.account.type === 'income' || entry.account.type === 'expense',
      )
      .slice(0, 8),
  };
}

export function getFundDetails(): readonly FundDetail[] {
  return getFundRecords().flatMap((fund) => {
    const detail = getFundDetail(fund.id);
    return detail ? [detail] : [];
  });
}

/* -------------------------------------------------------------------------
   Projects
   ------------------------------------------------------------------------- */

export function getProjectRecords(): readonly ProjectRecord[] {
  const funds = getFunds();
  const ledger = getLedger();

  return getProjects().map((project) => {
    const entries = ledger.filter((entry) => entry.projectId === project.id);

    const spent = entries
      .filter((entry) => entry.account.type === 'expense')
      .reduce((sum, entry) => sum + (entry.debit ?? 0), 0);

    const received = entries
      .filter((entry) => entry.account.type === 'income')
      .reduce((sum, entry) => sum + (entry.credit ?? 0), 0);

    const remaining = project.budget === null ? null : project.budget - spent;

    return {
      ...project,
      fundName: fundName(funds, project.fundId),
      spent,
      received,
      remaining,
      utilisation: project.budget === null ? null : share(spent, project.budget),
      isOverBudget: remaining !== null && remaining < 0,
      entryCount: entries.length / 2,
    };
  });
}

/* -------------------------------------------------------------------------
   Fixed deposits
   ------------------------------------------------------------------------- */

function resolveDeposit(
  deposit: FixedDeposit,
  funds: readonly Fund[],
  today: string,
): DepositRecord {
  const fullTermYears = yearsBetween(deposit.placedOn, deposit.maturesOn);
  const interestOnMaturity = simpleInterest(
    deposit.principal,
    deposit.interestRate,
    fullTermYears,
  );

  // Interest stops accruing at maturity — a deposit that has run its term
  // does not keep earning at the contracted rate.
  const accrualEnd = today < deposit.maturesOn ? today : deposit.maturesOn;
  const elapsedYears = Math.max(yearsBetween(deposit.placedOn, accrualEnd), 0);

  const daysToMaturity = daysBetween(today, deposit.maturesOn);
  const isActive = deposit.status === 'active';

  return {
    ...deposit,
    fundName: fundName(funds, deposit.fundId),
    interestOnMaturity,
    maturityValue: deposit.principal + interestOnMaturity,
    interestAccrued: simpleInterest(
      deposit.principal,
      deposit.interestRate,
      elapsedYears,
    ),
    daysToMaturity,
    isMaturingSoon:
      isActive && daysToMaturity >= 0 && daysToMaturity <= MATURITY_ALERT_DAYS,
    isOverdue: isActive && daysToMaturity < 0,
  };
}

export function getDepositRecords(
  today: string = getToday(),
): readonly DepositRecord[] {
  const funds = getFunds();

  return FIXED_DEPOSITS.map((deposit) =>
    resolveDeposit(deposit, funds, today),
  ).sort((a, b) => {
    // Live money first, then whatever is closest to needing attention.
    const aLive = a.status === 'active' ? 0 : 1;
    const bLive = b.status === 'active' ? 0 : 1;

    if (aLive !== bLive) return aLive - bLive;

    return a.maturesOn < b.maturesOn ? -1 : 1;
  });
}

/* -------------------------------------------------------------------------
   Assets
   ------------------------------------------------------------------------- */

function resolveAsset(
  asset: Asset,
  funds: readonly Fund[],
  today: string,
): AssetRecord {
  // A disposed asset stops depreciating on the day it left the temple.
  const throughDate = asset.disposedOn ?? today;
  const ageYears = Math.max(yearsBetween(asset.acquiredOn, throughDate), 0);

  const accumulated = accumulatedDepreciation(
    asset.cost,
    asset.depreciationRate,
    ageYears,
  );

  return {
    ...asset,
    fundName: fundName(funds, asset.fundId),
    ageYears,
    accumulatedDepreciation: accumulated,
    netBookValue: Math.max(asset.cost - accumulated, 0),
    annualDepreciation: asset.cost * (asset.depreciationRate / 100),
  };
}

export function getAssetRecords(
  today: string = getToday(),
): readonly AssetRecord[] {
  const funds = getFunds();

  return ASSETS.map((asset) => resolveAsset(asset, funds, today)).sort(
    (a, b) => {
      // Disposed items sink; everything else reads by tag.
      const aGone = a.status === 'disposed' ? 1 : 0;
      const bGone = b.status === 'disposed' ? 1 : 0;

      if (aGone !== bGone) return aGone - bGone;

      return a.tag.localeCompare(b.tag);
    },
  );
}

export function getAssetCategoryTotals(
  today: string = getToday(),
): readonly AssetCategoryTotal[] {
  const held = getAssetRecords(today).filter(
    (asset) => asset.status !== 'disposed',
  );

  const totals = new Map<AssetCategory, AssetCategoryTotal>();

  for (const asset of held) {
    const current = totals.get(asset.category);

    totals.set(asset.category, {
      category: asset.category,
      count: (current?.count ?? 0) + 1,
      cost: (current?.cost ?? 0) + asset.cost,
      netBookValue: (current?.netBookValue ?? 0) + asset.netBookValue,
    });
  }

  return [...totals.values()].sort((a, b) => b.netBookValue - a.netBookValue);
}

/* -------------------------------------------------------------------------
   Summary
   ------------------------------------------------------------------------- */

export function getFinanceSummary(
  today: string = getToday(),
): FinanceSummary {
  const deposits = getDepositRecords(today).filter(
    (deposit) => deposit.status === 'active',
  );

  const held = getAssetRecords(today).filter(
    (asset) => asset.status !== 'disposed',
  );

  return {
    fundBalance: getFundRecords().reduce((sum, fund) => sum + fund.balance, 0),
    depositPrincipal: deposits.reduce(
      (sum, deposit) => sum + deposit.principal,
      0,
    ),
    depositMaturityValue: deposits.reduce(
      (sum, deposit) => sum + deposit.maturityValue,
      0,
    ),
    assetCost: held.reduce((sum, asset) => sum + asset.cost, 0),
    assetNetBookValue: held.reduce((sum, asset) => sum + asset.netBookValue, 0),
  };
}
