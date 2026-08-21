/**
 * Accounting feature — public surface.
 *
 * Routes mount the ten feature boundaries below; everything else is an
 * implementation detail of this folder. Each boundary is a server component:
 * it resolves identity, capabilities and data before any client code runs.
 */
export {
  AccountOverviewFeature,
  ChartOfAccountsFeature,
  TransactionsFeature,
  CashBookFeature,
  BankBookFeature,
  BankAccountsFeature,
  ReceiptVouchersFeature,
  PaymentVouchersFeature,
  ApprovalsFeature,
  ReportsFeature,
} from './sections';

export {
  getAccountingAccess,
  canApproveVoucher,
  canEditVoucher,
  type AccountingAccess,
} from './lib/accounting-access';

export { ACCOUNTING_ROUTES } from './lib/routes';

export {
  getAccounts,
  getBankAccounts,
  getCashBook,
  getFunds,
  getFundPositions,
  getLedger,
  getProjects,
  getSummary,
  getVouchers,
} from './lib/accounting-service';

export {
  ACCOUNT_TYPE_LABELS,
  PAYMENT_MODE_LABELS,
  VOUCHER_KIND_LABELS,
  formatCurrency,
} from './lib/accounting-data';

export type {
  Account,
  AccountType,
  AccountingSummary,
  BankAccount,
  BookRow,
  Fund,
  FundPosition,
  LedgerRecord,
  Project,
  ProjectRef,
  ProjectStatus,
  Voucher,
  VoucherKind,
  VoucherRecord,
  VoucherStatus,
} from './types';
