/**
 * Portal routes for the financial management module.
 *
 * Kept in one place because the sidebar, the breadcrumbs and the cross-links
 * from accounting all have to agree on them.
 */
export const FINANCE_ROUTES = {
  funds: '/finance/funds',
  projects: '/finance/projects',
  fixedDeposits: '/finance/fixed-deposits',
  assets: '/finance/assets',
} as const;
