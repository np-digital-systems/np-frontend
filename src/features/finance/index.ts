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
