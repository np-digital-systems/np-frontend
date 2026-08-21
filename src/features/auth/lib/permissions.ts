import type { Permission } from '@/features/auth/types/permission';
import type { UserRole } from '@/features/auth/types/user-role';

/**
 * Role → capability matrix.
 *
 * The single place that answers "what is this role allowed to do".
 * Keep it exhaustive: `satisfies` below fails the build if a role is added
 * to UserRole without being granted a capability set here.
 */
export const ROLE_PERMISSIONS = {
  admin: [
    'dashboard:view',

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

    'fund:view',
    'fund:manage',
    'project:view',
    'project:manage',
    'fixed-deposit:view',
    'fixed-deposit:manage',
    'asset:view',
    'asset:manage',
    'asset:dispose',

    'report:generate',

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

    'contribution:view',
    'contribution:record',
    'contribution:manage',

    'user:manage',
    'role:manage',
    'financial-year:view',
    'financial-year:manage',
    'audit:view',
    'settings:manage',
  ],

  accountant: [
    'dashboard:view',

    // The bookkeeper owns the chart of accounts and the approval decision,
    // but opening or closing a bank account is the temple's act, not theirs.
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

    'fund:view',
    'fund:manage',
    'project:view',
    'project:manage',

    // Sees the temple's deposits and property and keeps their books; placing
    // a deposit or writing an asset off is the administrator's decision.
    'fixed-deposit:view',
    'asset:view',
    'asset:manage',

    'report:generate',

    // Read-only on events: the calendar and the sponsor directory feed
    // financial reporting, but the temple's schedule is the admin's to set.
    'event:view',
    'event:export',
    'event-schedule:view',
    'event-sponsor:view',

    // Keeps the subscription register and reads the year's boundaries;
    // opening or closing a financial year locks the books, so that stays
    // with the admin.
    'contribution:view',
    'contribution:record',
    'contribution:manage',
    'financial-year:view',
  ],

  // A cashier drafts and submits, but never approves its own work.
  cashier: [
    'dashboard:view',

    'transaction:view',
    'transaction:create',

    // "Income and expense entry creation" — drafts both kinds and submits
    // them, but holds no approve, no post, and no reach over anyone else's
    // vouchers.
    'receipt-voucher:view',
    'receipt-voucher:create',
    'payment-voucher:view',
    'payment-voucher:create',
    'voucher:create',
    'voucher:submit',

    'cash-book:view',

    // Needs to know which pooja a receipt belongs to and who sponsored it.
    'event:view',
    'event-schedule:view',
    'event-sponsor:view',

    // Takes the subscription at the counter and issues the receipt, but does
    // not decide who is on the register.
    'contribution:view',
    'contribution:record',
  ],

  // A devotee sees the temple calendar and nothing operational behind it.
  user: ['dashboard:view', 'event:view'],
} as const satisfies Record<UserRole, readonly Permission[]>;

export function getPermissions(role: UserRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function can(role: UserRole, permission: Permission): boolean {
  return (
    ROLE_PERMISSIONS[role] as readonly Permission[]
  ).includes(permission);
}

export function canAny(
  role: UserRole,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => can(role, permission));
}

export function canAll(
  role: UserRole,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => can(role, permission));
}
