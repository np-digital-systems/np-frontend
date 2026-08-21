/**
 * Financial management feature — public surface.
 *
 * Routes mount the four feature boundaries below; everything else is an
 * implementation detail of this folder. Each boundary is a server component:
 * it resolves identity, capabilities and data before any client code runs.
 *
 * Funds and projects are accounting masters, consumed from that module —
 * this feature manages them and adds the two domains of its own that nothing
 * posts against: fixed deposits and assets.
 */
export {
  FundsFeature,
  ProjectsFeature,
  FixedDepositsFeature,
  AssetsFeature,
} from './sections';

export { getFinanceAccess, type FinanceAccess } from './lib/finance-access';

export { FINANCE_ROUTES } from './lib/routes';

export {
  getAssetRecords,
  getAssetCategoryTotals,
  getDepositRecords,
  getFinanceSummary,
  getFundRecords,
  getProjectRecords,
} from './lib/finance-service';

export {
  ASSET_CATEGORY_LABELS,
  DEPOSIT_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  MATURITY_ALERT_DAYS,
} from './lib/finance-data';

export type {
  Asset,
  AssetCategory,
  AssetCondition,
  AssetRecord,
  AssetStatus,
  DepositRecord,
  DepositStatus,
  FinanceSummary,
  FixedDeposit,
  FundDetail,
  FundRecord,
  ProjectRecord,
} from './types';
