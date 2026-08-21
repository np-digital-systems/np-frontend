import { can } from '@/features/auth/lib/permissions';
import type { PortalUser } from '@/features/auth/types/user';
import type { UserRole } from '@/features/auth/types/user-role';

import type { Voucher, VoucherKind } from '../types';

/**
 * What the signed-in role may do on the accounting screens.
 *
 * Resolved once, on the server, at each page boundary and passed down as
 * plain booleans. Components never receive a role and never call `can`
 * themselves — so "who can approve a voucher" is answered by reading this
 * file, not by grepping for conditionals across twenty components.
 */
export interface AccountingAccess {
  /** The financial position screen — funds, income, expenditure. */
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
  /** Act on a voucher somebody else created. */
  readonly canManageAllVouchers: boolean;

  readonly canViewCashBook: boolean;
  readonly canViewBankBook: boolean;

  readonly canViewBankAccounts: boolean;
  readonly canManageBankAccounts: boolean;

  readonly canViewFunds: boolean;
  readonly canManageFunds: boolean;

  readonly canGenerateReports: boolean;

  /** True when any voucher can be created — drives the read-only banner. */
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

/* -------------------------------------------------------------------------
   Per-voucher rules

   Capability alone does not decide these: a cashier holds `voucher:create`
   and still may not touch a voucher that has already left their hands, and
   an approver may not approve one they wrote themselves.
   ------------------------------------------------------------------------- */

/** A voucher stops being editable the moment it leaves the drafter. */
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

/**
 * Segregation of duties: nobody approves their own entry.
 *
 * An accountant who drafts a payment voucher has to have somebody else sign
 * it off, which is the whole point of the approval step existing.
 */
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
