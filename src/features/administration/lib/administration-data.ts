import type { Permission } from '@/features/auth/types/permission';
import type { UserRole } from '@/features/auth/types/user-role';

import type {
  AuditAction,
  FinancialYearStatus,
  PermissionGroup,
} from '../types';

/** Money notation and dates are shared portal-wide — see `@/lib/format`. */
export {
  formatCurrency,
  formatLongDate,
  formatShortDate,
  monthName,
  getToday,
  getActiveYear,
} from '@/lib/format';

/* -------------------------------------------------------------------------
   Roles
   ------------------------------------------------------------------------- */

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  accountant: 'Accountant',
  cashier: 'Cashier',
  user: 'Devotee',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full control of the temple’s records, money and portal settings.',
  accountant:
    'Keeps the books: approves and posts entries, manages funds, generates statements.',
  cashier:
    'Takes money at the counter: drafts receipts and payments and submits them for approval.',
  user: 'A registered devotee. Sees the temple calendar and nothing operational.',
};

/**
 * Which roles the portal cannot be left without.
 *
 * An administrator is the only role that can restore any of the others, so
 * removing the last one would lock everybody out of the portal permanently.
 */
export const SYSTEM_ROLES: readonly UserRole[] = ['admin'];

/**
 * Permissions bucketed by the module they govern.
 *
 * Sixty capabilities as one flat list is unreadable; grouped by module it
 * answers the question people actually bring to this screen — "what can an
 * accountant do in accounting".
 */
export const PERMISSION_GROUPS: readonly PermissionGroup[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Reaching the portal at all.',
    permissions: ['dashboard:view'],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    description: 'The ledger, its vouchers and the approval chain.',
    permissions: [
      'account:view',
      'account:manage',
      'transaction:view',
      'transaction:create',
      'transaction:export',
      'receipt-voucher:view',
      'receipt-voucher:create',
      'payment-voucher:view',
      'payment-voucher:create',
      'voucher:create',
      'voucher:submit',
      'voucher:approve',
      'voucher:post',
      'voucher:manage-all',
      'cash-book:view',
      'bank-book:view',
      'bank-account:view',
      'bank-account:manage',
      'report:generate',
    ],
  },
  {
    id: 'finance',
    label: 'Financial Management',
    description: 'Funds, projects, deposits and the asset register.',
    permissions: [
      'fund:view',
      'fund:manage',
      'project:view',
      'project:manage',
      'fixed-deposit:view',
      'fixed-deposit:manage',
      'asset:view',
      'asset:manage',
      'asset:dispose',
    ],
  },
  {
    id: 'events',
    label: 'Events',
    description: 'The temple calendar, its types and its sponsors.',
    permissions: [
      'event:view',
      'event:create',
      'event:update',
      'event:delete',
      'event:complete',
      'event:export',
      'event-type:manage',
      'event-schedule:view',
      'event-sponsor:view',
      'event-sponsor:manage',
    ],
  },
  {
    id: 'contributions',
    label: 'Contributions',
    description: 'The Sanththa subscription register.',
    permissions: [
      'contribution:view',
      'contribution:record',
      'contribution:manage',
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    description: 'Accounts, roles, the audit trail and portal settings.',
    permissions: [
      'user:manage',
      'role:manage',
      'financial-year:view',
      'financial-year:manage',
      'audit:view',
      'settings:manage',
    ],
  },
];

/**
 * A readable name for a capability.
 *
 * Derived from the permission string rather than kept as a second list that
 * can fall out of step with it: `voucher:manage-all` reads as "Voucher ·
 * Manage all".
 */
export function describePermission(permission: Permission): {
  subject: string;
  action: string;
} {
  const [subject, action] = permission.split(':');

  return {
    subject: titleise(subject),
    action: titleise(action),
  };
}

function titleise(value: string): string {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/* -------------------------------------------------------------------------
   Audit
   ------------------------------------------------------------------------- */

export const AUDIT_ACTIONS: readonly AuditAction[] = [
  'create',
  'update',
  'delete',
  'approve',
  'reject',
  'post',
  'login',
  'logout',
  'permission-change',
];

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  approve: 'Approved',
  reject: 'Rejected',
  post: 'Posted',
  login: 'Signed in',
  logout: 'Signed out',
  'permission-change': 'Permissions changed',
};

/* -------------------------------------------------------------------------
   Financial years
   ------------------------------------------------------------------------- */

export const YEAR_STATUS_LABELS: Record<FinancialYearStatus, string> = {
  open: 'Open',
  closed: 'Closed',
  upcoming: 'Upcoming',
};

/* -------------------------------------------------------------------------
   Sessions
   ------------------------------------------------------------------------- */

/** `2026-08-21T09:30:00` → `21 Aug 2026, 9:30 AM`. */
export function formatStamp(stamp: string): string {
  const [date, time = ''] = stamp.split('T');
  const [year, month, day] = date.split('-').map(Number);
  const [rawHour, minute] = time.split(':');

  const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const datePart = `${day} ${MONTHS[month - 1]} ${year}`;

  if (!rawHour) return datePart;

  const hour24 = Number(rawHour);
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${datePart}, ${hour}:${minute} ${suffix}`;
}

/** "2 hours ago", "3 days ago" — for a last-seen column. */
export function timeAgo(stamp: string, now: string): string {
  const then = Date.parse(stamp);
  const current = Date.parse(`${now}T23:59:59`);

  if (Number.isNaN(then)) return '—';

  const minutes = Math.max(Math.round((current - then) / 60_000), 0);

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;

  return `${Math.round(days / 30)}mo ago`;
}
