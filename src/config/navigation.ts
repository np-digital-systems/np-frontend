

import { ACCOUNTING_ROUTES } from '@/features/accounting/lib/routes'
import { ADMIN_ROUTES } from '@/features/administration/lib/routes'
import { CONTRIBUTION_ROUTES } from '@/features/contributions/lib/routes'
import { FINANCE_ROUTES } from '@/features/finance/lib/routes'
import { EVENT_ROUTES } from '@/features/events/lib/routes'

import type { Permission } from '@/features/auth/types/permission'
import type { UserRole } from '@/features/auth/types/user-role'


// Site Navigation
export interface NavItem {
  readonly id: string
  readonly label: string
  readonly href: string
  readonly description?: string
}

export const mainNavItems = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
  },
  {
    id: 'events',
    label: 'Events',
    href: '/events',
  },
  {
    id: 'gallery',
    label: 'Gallery',
    href: '/gallery',
  },
  {
    id: 'contact',
    label: 'Contact',
    href: '/contact',
  },
] satisfies readonly NavItem[]


export const footerNavItems = {
  quickLinks: [
    {
      id: 'about',
      label: 'About Temple',
      href: '/about',
    },
    {
      id: 'events',
      label: 'Upcoming Events',
      href: '/events',
    },
    {
      id: 'gallery',
      label: 'Photo Gallery',
      href: '/gallery',
    },
    {
      id: 'contact',
      label: 'Contact Us',
      href: '/contact',
    },
  ],

  // Only destinations that exist. Puja booking and a public notices page
  // have not been built; adding them back means adding the routes too.
  services: [
    {
      id: 'calendar',
      label: 'Temple Calendar',
      href: '/events',
    },
    {
      id: 'donations',
      label: 'Donations',
      href: '/#donation-section',
    },
    {
      id: 'gallery',
      label: 'Photo Gallery',
      href: '/gallery',
    },
    {
      id: 'contact',
      label: 'Visit the Temple',
      href: '/contact',
    },
  ],
} as const


// Portal Navigation
export type PortalIcon =
  | 'dashboard'
  | 'calendar'
  | 'tag'
  | 'calendar-days'
  | 'handshake'
  | 'chart'
  | 'transfer'
  | 'receipt'
  | 'credit-card'
  | 'book'
  | 'landmark'
  | 'list'
  | 'wallet'
  | 'folder'
  | 'piggy-bank'
  | 'package'
  | 'users'
  | 'check'
  | 'report'
  | 'user'
  | 'shield'
  | 'calendar-range'
  | 'settings'
  | 'clipboard';

export interface PortalNavItem {
  id: string;
  label: string;
  href: string;
  icon: PortalIcon;
  description?: string;

  /**
   * Preferred gate: the capability the destination itself checks.
   *
   * Naming the permission instead of listing roles means the sidebar and the
   * page can never disagree — re-mapping a role in ROLE_PERMISSIONS moves
   * both at once. `allowedRoles` remains for destinations that have not been
   * given a capability yet.
   */
  requiredPermission?: Permission;
  allowedRoles?: readonly UserRole[];
}

export interface PortalNavGroup {
  id: string;
  label: string;
  items: readonly PortalNavItem[];
  defaultOpen?: boolean;
}

/*
 * The portal's navigation, grouped by what somebody is doing rather than by
 * what kind of record it touches.
 *
 * A clerk raising receipts all morning, an accountant reading the books, and a
 * trustee setting the year up are three different jobs, and the old single
 * twelve-item "Accounting" group made each of them wade through the other two.
 * Daily work first, because it is opened a hundred times a day; the things
 * configured once a year sit at the bottom under Setup.
 */
export const portalNavigation: readonly PortalNavGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    defaultOpen: true,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'dashboard',
        allowedRoles: ['admin', 'accountant', 'cashier', 'user'],
      },
    ],
  },

  {
    id: 'daily-entry',
    label: 'Daily Entry',
    defaultOpen: true,
    items: [
      {
        id: 'receipt-vouchers',
        label: 'Receipt Vouchers',
        href: ACCOUNTING_ROUTES.receipts,
        icon: 'receipt',
        description: 'Money received',
        requiredPermission: 'receipt-voucher:view',
      },
      {
        id: 'payment-vouchers',
        label: 'Payment Vouchers',
        href: ACCOUNTING_ROUTES.payments,
        icon: 'credit-card',
        description: 'Money paid out',
        requiredPermission: 'payment-voucher:view',
      },
      {
        id: 'approval-center',
        label: 'Approval Center',
        href: ACCOUNTING_ROUTES.approvals,
        icon: 'check',
        description: 'Vouchers waiting on a decision',
        requiredPermission: 'voucher:approve',
      },
      {
        id: 'sanththa',
        label: 'Sanththa',
        href: CONTRIBUTION_ROUTES.sanththa,
        icon: 'users',
        description: 'The members’ subscription register and its dues',
        requiredPermission: 'contribution:view',
      },
    ],
  },

  {
    id: 'events',
    label: 'Events',
    defaultOpen: true,
    items: [
      {
        id: 'event-calendar',
        label: 'Event Calendar',
        href: EVENT_ROUTES.calendar,
        icon: 'calendar',
        description: 'Every pooja and festival on the temple year',
        requiredPermission: 'event:view',
      },
      {
        id: 'yearly-schedule',
        label: 'Yearly Schedule',
        href: EVENT_ROUTES.schedule,
        icon: 'calendar-range',
        description: 'Every slot of the year, sponsored or not',
        requiredPermission: 'event-schedule:view',
      },
      {
        id: 'sponsors',
        label: 'Sponsors',
        href: EVENT_ROUTES.sponsors,
        icon: 'handshake',
        description: 'Who has taken which pooja',
        requiredPermission: 'event-sponsor:view',
      },
    ],
  },

  {
    id: 'books',
    label: 'Books & Reports',
    defaultOpen: true,
    items: [
      {
        id: 'account-overview',
        label: 'Account Overview',
        href: ACCOUNTING_ROUTES.overview,
        icon: 'chart',
        description: 'Income, expenditure and fund position',
        requiredPermission: 'fund:view',
      },
      {
        id: 'cash-book',
        label: 'Cash Book',
        href: ACCOUNTING_ROUTES.cashBook,
        icon: 'book',
        description: 'Day-wise cash receipts and payments',
        requiredPermission: 'cash-book:view',
      },
      {
        id: 'bank-book',
        label: 'Bank Book',
        href: ACCOUNTING_ROUTES.bankBook,
        icon: 'book',
        description: 'Per-account bank statement',
        requiredPermission: 'bank-book:view',
      },
      {
        id: 'transactions',
        label: 'Transactions',
        href: ACCOUNTING_ROUTES.transactions,
        icon: 'transfer',
        description: 'The posted ledger',
        requiredPermission: 'transaction:view',
      },
      {
        id: 'reports',
        label: 'Reports',
        href: ACCOUNTING_ROUTES.reports,
        icon: 'report',
        description: 'Statements and registers',
        requiredPermission: 'report:generate',
      },
    ],
  },

  {
    /*
     * What the temple owns and what it has put away — deliberately apart from
     * the books. "Assets" alone read as the accounting sense of the word, which
     * takes in cash and bank too; this group is the register of property.
     */
    id: 'property',
    label: 'Property & Investments',
    items: [
      {
        id: 'assets',
        label: 'Asset Register',
        href: FINANCE_ROUTES.assets,
        icon: 'package',
        description: 'Jewellery, vahanam, land and equipment the temple owns',
        requiredPermission: 'asset:view',
      },
      {
        id: 'fixed-deposits',
        label: 'Fixed Deposits',
        href: FINANCE_ROUTES.fixedDeposits,
        icon: 'piggy-bank',
        description: 'Deposits placed, their maturities and interest',
        requiredPermission: 'fixed-deposit:view',
      },
    ],
  },

  {
    /*
     * The master records every voucher is coded against. Set up once and rarely
     * touched again, so they sit below the daily work rather than among it.
     */
    id: 'setup',
    label: 'Setup',
    items: [
      {
        id: 'chart-of-accounts',
        label: 'Chart of Accounts',
        href: ACCOUNTING_ROUTES.chartOfAccounts,
        icon: 'list',
        description: 'The ledger heads every entry posts to',
        requiredPermission: 'account:view',
      },
      {
        id: 'activities',
        label: 'Activities',
        href: ACCOUNTING_ROUTES.activities,
        icon: 'tag',
        description: 'What entries are for — poojas, annadhanam, thiruppani',
        requiredPermission: 'activity:view',
      },
      {
        id: 'parties',
        label: 'Parties',
        href: ACCOUNTING_ROUTES.parties,
        icon: 'user',
        description: 'Sponsors, staff and vendors entries are with',
        requiredPermission: 'party:view',
      },
      {
        id: 'funds',
        label: 'Funds',
        href: FINANCE_ROUTES.funds,
        icon: 'wallet',
        description: 'The temple’s earmarked pools of money',
        requiredPermission: 'fund:view',
      },
      {
        id: 'projects',
        label: 'Projects',
        href: FINANCE_ROUTES.projects,
        icon: 'folder',
        description: 'Thiruppani and festival work, budget against actual',
        requiredPermission: 'project:view',
      },
      {
        id: 'bank-accounts',
        label: 'Bank Accounts',
        href: ACCOUNTING_ROUTES.bankAccounts,
        icon: 'landmark',
        description: 'The temple’s bank and fixed deposit accounts',
        requiredPermission: 'bank-account:view',
      },
      {
        id: 'event-types',
        label: 'Pooja Types',
        href: EVENT_ROUTES.types,
        icon: 'list',
        description: 'The recurring observances the calendar is built from',
        requiredPermission: 'event:view',
      },
      {
        id: 'financial-years',
        label: 'Financial Years',
        href: ADMIN_ROUTES.financialYears,
        icon: 'calendar-range',
        description: 'The year the books are kept in',
        requiredPermission: 'financial-year:view',
      },
    ],
  },

  {
    id: 'administration',
    label: 'Administration',
    items: [
      {
        id: 'users',
        label: 'Users',
        href: ADMIN_ROUTES.users,
        icon: 'user',
        description: 'Portal accounts and their active sessions',
        requiredPermission: 'user:manage',
      },
      {
        id: 'roles',
        label: 'Roles & Permissions',
        href: ADMIN_ROUTES.roles,
        icon: 'shield',
        description: 'What each role is allowed to do',
        requiredPermission: 'role:manage',
      },
      {
        id: 'audit-log',
        label: 'Audit Log',
        href: ADMIN_ROUTES.auditLog,
        icon: 'clipboard',
        description: 'Who did what, and when',
        requiredPermission: 'audit:view',
      },
      {
        id: 'settings',
        label: 'Settings',
        href: ADMIN_ROUTES.settings,
        icon: 'settings',
        description: 'Your profile, your sessions and portal defaults',
      },
    ],
  },
];