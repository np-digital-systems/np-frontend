/**
 * Portal routes for the accounting module.
 *
 * Kept in one place because the sidebar, the breadcrumbs, the dashboard
 * shortcuts and the cross-links between accounting screens all have to agree
 * on them.
 */
export const ACCOUNTING_ROUTES = {
  overview: '/accounting',
  chartOfAccounts: '/accounting/chart-of-accounts',
  transactions: '/accounting/transactions',
  cashBook: '/accounting/cash-book',
  bankBook: '/accounting/bank-book',
  bankAccounts: '/accounting/bank-accounts',
  receipts: '/accounting/receipts',
  payments: '/accounting/payments',
  approvals: '/accounting/approvals',
  reports: '/accounting/reports',
} as const;
