import type { PortalSettings } from '../types';

import type { Permission } from '@/features/auth/types/permission';
import type { UserRole } from '@/features/auth/types/user-role';

import type {
  AuditAction,
  FinancialYearStatus,
  PermissionGroup,
} from '../types';

export {
  formatCurrency,
  formatLongDate,
  formatShortDate,
  formatStamp,
  monthName,
  getToday,
  getActiveYear,
  timeAgo,
} from '@/lib/format';

/*
 * Roles belong to the auth feature: administration renders the vocabulary, it
 * does not own it. Re-exported here so the screens below keep their local
 * import — and so the user register, the role matrix and the login page can
 * never describe the same role in two different ways.
 */
export { ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/features/auth/lib/auth-data';

export const SYSTEM_ROLES: readonly UserRole[] = ['admin'];

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

export const YEAR_STATUS_LABELS: Record<FinancialYearStatus, string> = {
  open: 'Open',
  closed: 'Closed',
  upcoming: 'Upcoming',
};


/**
 * What the portal falls back to for a settings key nobody has changed yet.
 *
 * The API stores only the keys an administrator has actually edited, so a key
 * the temple has never touched reads from here rather than arriving empty.
 */
export const DEFAULT_SETTINGS: PortalSettings = {
  temple: {
    name: 'Neeliyampathi Pillaiyar Kovil',
    nameTa: 'நீலியம்பனை பிள்ளையார் கோவில்',
    registrationNo: 'JF/RT/2004/118',
    address: 'நீலியம்பனை ,மல்லாகம் , யாழ்ப்பாணம், இலங்கை',
    phone: '021 222 3344',
    email: 'info@neeliyampathipillaiyarkovil.com',
    website: 'www.neeliyampathipillaiyarkovil.com',
  },
  locale: {
    defaultLanguage: 'ta',
    timeZone: 'Asia/Colombo',
    dateFormat: 'dd-mon-yyyy',
  },
  accounting: {
    cashAccountId: null,
    receiptPrefix: 'RV',
    paymentPrefix: 'PV',
    yearStartMonth: 1,
    approvalThreshold: 50_000,
    requireSeparatePoster: true,
  },
  notifications: {
    voucherSubmitted: true,
    voucherApproved: true,
    voucherRejected: true,
    depositMaturing: true,
    sanththaArrears: true,
    eventReminders: false,
  },
};
