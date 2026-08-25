import { can } from '@/features/auth/lib/permissions';
import type { PortalUser } from '@/features/auth/types/user';
import type { UserRole } from '@/features/auth/types/user-role';

import type { Voucher, VoucherKind } from '../types';

export interface AccountingAccess {
    readonly canViewOverview: boolean;

  readonly canViewAccounts: boolean;
  readonly canManageAccounts: boolean;

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

export function getAccountingAccess(role: UserRole): AccountingAccess {
  const canCreateReceipts = can(role, 'receipt-voucher:create');
  const canCreatePayments = can(role, 'payment-voucher:create');

  return {
    canViewOverview: can(role, 'fund:view'),

    canViewAccounts: can(role, 'account:view'),
    canManageAccounts: can(role, 'account:manage'),

    canViewTransactions: can(role, 'transaction:view'),
    canExportTransactions: can(role, 'transaction:export'),

    canViewReceipts: can(role, 'receipt-voucher:view'),
    canCreateReceipts,
    canViewPayments: can(role, 'payment-voucher:view'),
    canCreatePayments,

    canSubmit: can(role, 'voucher:submit'),
    canApprove: can(role, 'voucher:approve'),
    canPost: can(role, 'voucher:post'),
    canManageAllVouchers: can(role, 'voucher:manage-all'),

    canViewCashBook: can(role, 'cash-book:view'),
    canViewBankBook: can(role, 'bank-book:view'),

    canViewBankAccounts: can(role, 'bank-account:view'),
    canManageBankAccounts: can(role, 'bank-account:manage'),

    canViewFunds: can(role, 'fund:view'),
    canManageFunds: can(role, 'fund:manage'),

    canGenerateReports: can(role, 'report:generate'),

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

const EDITABLE_STATUSES = new Set(['Draft', 'Rejected']);

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
  // Only a draft is ever deleted. Anything that has been submitted leaves a
  // trail that has to be cancelled, not erased.
  if (voucher.status !== 'Draft') return false;

  return canEditVoucher(voucher, access, user);
}

export function canSubmitVoucher(
  voucher: Voucher,
  access: AccountingAccess,
  user: PortalUser,
): boolean {
  if (!access.canSubmit) return false;
  if (!EDITABLE_STATUSES.has(voucher.status)) return false;

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
