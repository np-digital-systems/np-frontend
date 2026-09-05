import 'server-only';

import { api } from '@/lib/api';
import { getActiveFinancialYearId } from '@/lib/financial-year';

import type { LedgerRecord } from '@/features/accounting';

import type {
  AssetCategoryTotal,
  AssetRecord,
  DepositRecord,
  FinanceSummary,
  FundBreakdownLine,
  FundDetail,
  FundRecord,
  ProjectRecord,
} from '../types';

/**
 * Funds, projects, deposits and assets, read from the API.
 *
 * Interest, depreciation and every fund position are worked out server-side
 * from the ledger and the deposit terms, so nothing here recomputes them.
 *
 * Movement figures follow the year chosen in the header. Deposits and assets
 * do not: a deposit runs to its maturity date and an asset depreciates on its
 * own schedule, neither of which a reporting year has any say over.
 */

export async function getFundRecords(): Promise<readonly FundRecord[]> {
  return api.get<readonly FundRecord[]>('/funds', {
    query: { financialYearId: await getActiveFinancialYearId() },
  });
}

interface Breakdown {
  readonly income: readonly FundBreakdownLine[];
  readonly expenses: readonly FundBreakdownLine[];
}

export async function getFundDetail(fundId: number): Promise<FundDetail | null> {
  try {
    const financialYearId = await getActiveFinancialYearId();

    const [fund, breakdown, recent] = await Promise.all([
      api.get<FundRecord>(`/funds/${fundId}`, { query: { financialYearId } }),
      api.get<Breakdown>(`/funds/${fundId}/breakdown`, { query: { financialYearId } }),
      api
        .get<{ data: readonly LedgerRecord[] }>('/ledger', {
          query: { fundId, limit: 10, financialYearId },
        })
        .then((page) => page.data),
    ]);

    return { fund, income: breakdown.income, expenses: breakdown.expenses, recent };
  } catch {
    return null;
  }
}

export async function getFundDetails(): Promise<readonly FundDetail[]> {
  const funds = await getFundRecords();
  const details = await Promise.all(funds.map((fund) => getFundDetail(fund.id)));

  return details.filter((detail): detail is FundDetail => detail !== null);
}

export async function getProjectRecords(): Promise<readonly ProjectRecord[]> {
  return api.get<readonly ProjectRecord[]>('/projects', {
    query: { financialYearId: await getActiveFinancialYearId() },
  });
}

export async function getDepositRecords(): Promise<readonly DepositRecord[]> {
  return api.get<readonly DepositRecord[]>('/fixed-deposits');
}

export async function getAssetRecords(): Promise<readonly AssetRecord[]> {
  return api.get<readonly AssetRecord[]>('/assets');
}

export async function getAssetCategoryTotals(): Promise<readonly AssetCategoryTotal[]> {
  return api.get<readonly AssetCategoryTotal[]>('/assets/by-category');
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  return api.get<FinanceSummary>('/reports/finance-summary', {
    query: { financialYearId: await getActiveFinancialYearId() },
  });
}
