

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

  services: [
    {
      id: 'puja',
      label: 'Puja Booking',
      href: '/bookings',
    },
    {
      id: 'donations',
      label: 'Donations',
      href: '/donations',
    },
    {
      id: 'notices',
      label: 'Notices',
      href: '/notices',
    },
    {
      id: 'calendar',
      label: 'Temple Calendar',
      href: '/events',
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
  allowedRoles?: readonly UserRole[];
}

export interface PortalNavGroup {
  id: string;
  label: string;
  items: readonly PortalNavItem[];
  defaultOpen?: boolean;
}

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
    id: 'events',
    label: 'Event Management',
    defaultOpen: true,
    items: [
      {
        id: 'event-calendar',
        label: 'Event Calendar',
        href: '/events',
        icon: 'calendar',
        allowedRoles: ['admin', 'accountant', 'cashier'],
      },
      {
        id: 'event-types',
        label: 'Event Types',
        href: '/events/types',
        icon: 'tag',
        allowedRoles: ['admin'],
      },
      {
        id: 'yearly-schedule',
        label: 'Yearly Schedule',
        href: '/events/schedule',
        icon: 'calendar-days',
        allowedRoles: ['admin', 'accountant', 'cashier'],
      },
      {
        id: 'sponsors',
        label: 'Sponsors',
        href: '/events/sponsors',
        icon: 'handshake',
        allowedRoles: ['admin'],
      },
    ],
  },

  {
    id: 'accounting',
    label: 'Accounting',
    defaultOpen: true,
    items: [
      {
        id: 'account-overview',
        label: 'Account Overview',
        href: '/accounting',
        icon: 'chart',
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'chart-of-accounts',
        label: 'Chart of Accounts',
        href: '/accounting/chart-of-accounts',
        icon: 'list',
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'transactions',
        label: 'Transactions',
        href: '/accounting/transactions',
        icon: 'transfer',
        allowedRoles: ['admin', 'accountant', 'cashier'],
      },
      {
        id: 'cash-book',
        label: 'Cash Book',
        href: '/accounting/cash-book',
        icon: 'book',
        allowedRoles: ['admin', 'accountant', 'cashier'],
      },
      {
        id: 'bank-book',
        label: 'Bank Book',
        href: '/accounting/bank-book',
        icon: 'landmark',
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'bank-accounts',
        label: 'Bank Accounts',
        href: '/accounting/bank-accounts',
        icon: 'landmark',
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'receipt-vouchers',
        label: 'Receipt Vouchers',
        href: '/accounting/receipts',
        icon: 'receipt',
        allowedRoles: ['admin', 'accountant', 'cashier'],
      },
      {
        id: 'payment-vouchers',
        label: 'Payment Vouchers',
        href: '/accounting/payments',
        icon: 'credit-card',
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'approval-center',
        label: 'Approval Center',
        href: '/accounting/approvals',
        icon: 'check',
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/accounting/reports',
        icon: 'report',
        allowedRoles: ['admin', 'accountant'],
      },
    ],
  },

  {
    id: 'finance',
    label: 'Financial Management',
    defaultOpen: true,
    items: [
      {
        id: 'funds',
        label: 'Funds',
        href: '/finance/funds',
        icon: 'wallet',
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'projects',
        label: 'Projects',
        href: '/finance/projects',
        icon: 'folder',
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'fixed-deposits',
        label: 'Fixed Deposits',
        href: '/finance/fixed-deposits',
        icon: 'piggy-bank',
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'assets',
        label: 'Assets',
        href: '/finance/assets',
        icon: 'package',
        allowedRoles: ['admin', 'accountant'],
      },
    ],
  },

  {
    id: 'contributions',
    label: 'Temple Contributions',
    defaultOpen: true,
    items: [
      {
        id: 'sanththa',
        label: 'Sanththa',
        href: '/contributions/sanththa',
        icon: 'users',
        allowedRoles: ['admin', 'accountant', 'cashier'],
      },
    ],
  },

  {
    id: 'administration',
    label: 'Administration',
    defaultOpen: true,
    items: [
      {
        id: 'users',
        label: 'Users',
        href: '/administration/users',
        icon: 'user',
        allowedRoles: ['admin'],
      },
      {
        id: 'roles',
        label: 'Roles & Permissions',
        href: '/administration/roles',
        icon: 'shield',
        allowedRoles: ['admin'],
      },
      {
        id: 'audit-log',
        label: 'Audit Log',
        href: '/administration/audit-log',
        icon: 'clipboard',
        allowedRoles: ['admin'],
      },
      {
        id: 'financial-years',
        label: 'Financial Years',
        href: '/administration/financial-years',
        icon: 'calendar-range',
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/administration/settings',
        icon: 'settings',
        allowedRoles: ['admin'],
      },
    ],
  },
];