import { can } from '@/features/auth/lib/permissions';
import type { Permission } from '@/features/auth/types/permission';
import type { PortalUser } from '@/features/auth/types/user';

import type { Voucher, VoucherKind } from '../types';

export interface AccountingAccess {
    readonly canViewOverview: boolean;

  readonly canViewAccounts: boolean;
  readonly canManageAccounts: boolean;
  readonly canViewActivities: boolean;
  readonly canManageActivities: boolean;
  readonly canViewParties: boolean;
  readonly canManageParties: boolean;

  readonly canViewTransactions: boolean;
  readonly canExportTransactions: boolean;

  readonly canViewReceipts: boolean;
  readonly canCreateReceipts: boolean;
  readonly canViewPayments: boolean;
  readonly canCreatePayments: boolean;

  readonly canSubmit: boolean;
  readonly canApprove: boolean;
  readonly canPost: boolean;
    readonly canManageAllVouchers: boolean;

  readonly canViewCashBook: boolean;
  readonly canViewBankBook: boolean;

  readonly canViewBankAccounts: boolean;
  readonly canManageBankAccounts: boolean;

  readonly canViewFunds: boolean;
  readonly canManageFunds: boolean;

  readonly canGenerateReports: boolean;

    readonly canCreateVouchers: boolean;
}

export function getAccountingAccess(granted: readonly Permission[]): AccountingAccess {
  const canCreateReceipts = can(granted, 'receipt-voucher:create');
  const canCreatePayments = can(granted, 'payment-voucher:create');

  return {
    canViewOverview: can(granted, 'fund:view'),

    canViewAccounts: can(granted, 'account:view'),
    canManageAccounts: can(granted, 'account:manage'),
    canViewActivities: can(granted, 'activity:view'),
    canManageActivities: can(granted, 'activity:manage'),
    canViewParties: can(granted, 'party:view'),
    canManageParties: can(granted, 'party:manage'),

    canViewTransactions: can(granted, 'transaction:view'),
    canExportTransactions: can(granted, 'transaction:export'),

    canViewReceipts: can(granted, 'receipt-voucher:view'),
    canCreateReceipts,
    canViewPayments: can(granted, 'payment-voucher:view'),
    canCreatePayments,

    canSubmit: can(granted, 'voucher:submit'),
    canApprove: can(granted, 'voucher:approve'),
    canPost: can(granted, 'voucher:post'),
    canManageAllVouchers: can(granted, 'voucher:manage-all'),

    canViewCashBook: can(granted, 'cash-book:view'),
    canViewBankBook: can(granted, 'bank-book:view'),

    canViewBankAccounts: can(granted, 'bank-account:view'),
    canManageBankAccounts: can(granted, 'bank-account:manage'),

    canViewFunds: can(granted, 'fund:view'),
    canManageFunds: can(granted, 'fund:manage'),

    canGenerateReports: can(granted, 'report:generate'),

    canCreateVouchers: canCreateReceipts || canCreatePayments,
  };
}

export function canViewKind(
  access: AccountingAccess,
  kind: VoucherKind,
): boolean {
  return kind === 'receipt' ? access.canViewReceipts : access.canViewPayments;
}

export function canCreateKind(
  access: AccountingAccess,
  kind: VoucherKind,
): boolean {
  return kind === 'receipt'
    ? access.canCreateReceipts
    : access.canCreatePayments;
}

/*
 * Anything short of approval can still be corrected. Editing an entry that is
 * waiting on an approver returns it to Draft, so the correction is resubmitted
 * rather than slipping past the person reviewing it.
 */
const EDITABLE_STATUSES = new Set(['Draft', 'Pending Approval', 'Rejected']);

/** A pending entry is already with an approver; it is withdrawn, not resent. */
const SUBMITTABLE_STATUSES = new Set(['Draft', 'Rejected']);

/*
 * A rejected entry is left alone: it is already out of the approver's hands and
 * its trail is the record of why. Correct and resubmit it, or leave it.
 */
const CANCELLABLE_STATUSES = new Set(['Draft', 'Pending Approval']);

export function isOwnVoucher(voucher: Voucher, userId: string): boolean {
  return voucher.createdBy.id === userId;
}

export function canEditVoucher(
  voucher: Voucher,
  access: AccountingAccess,
  user: PortalUser,
): boolean {
  if (!canCreateKind(access, voucher.kind)) return false;
  if (!EDITABLE_STATUSES.has(voucher.status)) return false;

  return access.canManageAllVouchers || isOwnVoucher(voucher, user.id);
}

export function canDeleteVoucher(
  voucher: Voucher,
  access: AccountingAccess,
  user: PortalUser,
): boolean {
  // Nothing is ever erased. A draft or a pending entry is cancelled, which
  // leaves the reference in place and out of every total.
  if (!CANCELLABLE_STATUSES.has(voucher.status)) return false;

  return canEditVoucher(voucher, access, user);
}

export function canSubmitVoucher(
  voucher: Voucher,
  access: AccountingAccess,
  user: PortalUser,
): boolean {
  if (!access.canSubmit) return false;
  if (!SUBMITTABLE_STATUSES.has(voucher.status)) return false;

  return access.canManageAllVouchers || isOwnVoucher(voucher, user.id);
}

export function canApproveVoucher(
  voucher: Voucher,
  access: AccountingAccess,
  user: PortalUser,
): boolean {
  if (!access.canApprove) return false;
  if (voucher.status !== 'Pending Approval') return false;

  return !isOwnVoucher(voucher, user.id);
}

export function canPostVoucher(
  voucher: Voucher,
  access: AccountingAccess,
): boolean {
  return access.canPost && voucher.status === 'Approved';
}

export const READ_ONLY_MESSAGE =
  'You have view access to these records. Creating and approving entries is restricted to roles with the matching accounting permissions.';

export const SELF_APPROVAL_MESSAGE =
  'You cannot approve an entry you created yourself — another approver has to act on it.';
