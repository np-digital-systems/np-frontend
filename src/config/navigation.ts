import {
  LayoutDashboard,
  Calendar,
  Tag,
  CalendarDays,
  Handshake,
  BarChart3,
  ArrowLeftRight,
  Receipt,
  CreditCard,
  BookOpen,
  Landmark,
  ListTree,
  Wallet,
  FolderOpen,
  PiggyBank,
  Package,
  Users,
  CheckSquare,
  FileBarChart,
  UserCog,
  Shield,
  CalendarRange,
  Settings,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'

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
export interface PortalNavItem {
  readonly id: string
  readonly icon: LucideIcon
  readonly label: string
  readonly href: string
  readonly allowedRoles?: readonly UserRole[]
}

export interface PortalNavGroup {
  readonly id: string
  readonly label: string
  readonly items: readonly PortalNavItem[]
}

export const portalNavigation = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },

  {
    id: 'event-management',
    label: 'Event Management',
    items: [
      {
        id: 'event-calendar',
        label: 'Event Calendar',
        href: '/events',
        icon: Calendar,
        allowedRoles: ['admin', 'accountant', 'cashier'],
      },
      {
        id: 'event-types',
        label: 'Event Types',
        href: '/events/types',
        icon: Tag,
        allowedRoles: ['admin'],
      },
      {
        id: 'yearly-schedule',
        label: 'Yearly Schedule',
        href: '/events/schedule',
        icon: CalendarDays,
        allowedRoles: ['admin', 'accountant', 'cashier'],
      },
      {
        id: 'sponsors',
        label: 'Sponsors',
        href: '/events/sponsors',
        icon: Handshake,
        allowedRoles: ['admin'],
      },
    ],
  },

  {
    id: 'accounting',
    label: 'Accounting',
    items: [
      {
        id: 'account-overview',
        label: 'Account Overview',
        href: '/accounting',
        icon: BarChart3,
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'chart-of-accounts',
        label: 'Chart of Accounts',
        href: '/accounting/chart-of-accounts',
        icon: ListTree,
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'transactions',
        label: 'Transactions',
        href: '/accounting/transactions',
        icon: ArrowLeftRight,
        allowedRoles: ['admin', 'accountant', 'cashier'],
      },
      {
        id: 'cash-book',
        label: 'Cash Book',
        href: '/accounting/cash-book',
        icon: BookOpen,
        allowedRoles: ['admin', 'accountant', 'cashier'],
      },
      {
        id: 'bank-book',
        label: 'Bank Book',
        href: '/accounting/bank-book',
        icon: Landmark,
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'bank-accounts',
        label: 'Bank Accounts',
        href: '/accounting/bank-accounts',
        icon: Landmark,
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'receipt-vouchers',
        label: 'Receipt Vouchers',
        href: '/accounting/receipts',
        icon: Receipt,
        allowedRoles: ['admin', 'accountant', 'cashier'],
      },
      {
        id: 'payment-vouchers',
        label: 'Payment Vouchers',
        href: '/accounting/payments',
        icon: CreditCard,
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'approval-center',
        label: 'Approval Center',
        href: '/accounting/approvals',
        icon: CheckSquare,
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/accounting/reports',
        icon: FileBarChart,
        allowedRoles: ['admin', 'accountant'],
      },
    ],
  },

  {
    id: 'financial-management',
    label: 'Financial Management',
    items: [
      {
        id: 'funds',
        label: 'Funds',
        href: '/finance/funds',
        icon: Wallet,
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'projects',
        label: 'Projects',
        href: '/finance/projects',
        icon: FolderOpen,
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'fixed-deposits',
        label: 'Fixed Deposits',
        href: '/finance/fixed-deposits',
        icon: PiggyBank,
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'assets',
        label: 'Assets',
        href: '/finance/assets',
        icon: Package,
        allowedRoles: ['admin', 'accountant'],
      },
    ],
  },

  {
    id: 'temple-contributions',
    label: 'Temple Contributions',
    items: [
      {
        id: 'sanththa',
        label: 'Sanththa',
        href: '/contributions/sanththa',
        icon: Users,
        allowedRoles: ['admin', 'accountant', 'cashier'],
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
        href: '/administration/users',
        icon: UserCog,
        allowedRoles: ['admin'],
      },
      {
        id: 'roles-permissions',
        label: 'Roles & Permissions',
        href: '/administration/roles',
        icon: Shield,
        allowedRoles: ['admin'],
      },
      {
        id: 'audit-log',
        label: 'Audit Log',
        href: '/administration/audit-log',
        icon: ClipboardList,
        allowedRoles: ['admin'],
      },
      {
        id: 'financial-years',
        label: 'Financial Years',
        href: '/administration/financial-years',
        icon: CalendarRange,
        allowedRoles: ['admin', 'accountant'],
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/administration/settings',
        icon: Settings,
        allowedRoles: ['admin'],
      },
    ],
  },
] satisfies readonly PortalNavGroup[]