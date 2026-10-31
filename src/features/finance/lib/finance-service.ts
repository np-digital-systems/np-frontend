import 'server-only';

import { api } from '@/lib/api';
import { getActiveFinancialYearId } from '@/lib/financial-year';

import type { LedgerRecord } from '@/features/accounting';

import type {
  AssetCategoryTotal,
  AssetRecord,
  DepositInterest,
  DepositRecord,
  DepositVoucher,
  FinanceSummary,
  FundBreakdownLine,
  FundDetail,
  FundRecord,
  PoojaFunding,
  ProjectRecord,
  SlotOption,
} from '../types';

// Interest, depreciation and fund positions come from the API. Movements follow the header's
// year; deposits and assets don't (they run on their own maturity and depreciation schedules).

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

export async function getDepositRecord(id: number): Promise<DepositRecord | null> {
  return api.get<DepositRecord>(`/fixed-deposits/${id}`).catch(() => null);
}

export async function getDepositVouchers(id: number): Promise<readonly DepositVoucher[]> {
  return api.get<readonly DepositVoucher[]>(`/fixed-deposits/${id}/vouchers`);
}

export async function getDepositInterestByYear(id: number): Promise<DepositInterest> {
  return api.get<DepositInterest>(`/fixed-deposits/${id}/interest`);
}

export async function getSlotOptions(): Promise<readonly SlotOption[]> {
  return api.get<readonly SlotOption[]>('/fixed-deposits/slot-options');
}

export async function getPoojaFunding(): Promise<PoojaFunding | null> {
  const financialYearId = await getActiveFinancialYearId();

  return api
    .get<PoojaFunding>('/fixed-deposits/pooja-funding', { query: { financialYearId } })
    .catch(() => null);
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
