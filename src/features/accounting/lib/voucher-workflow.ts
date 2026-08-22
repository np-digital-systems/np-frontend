import type { PortalUser } from '@/features/auth/types/user';

import type { VoucherRecord, VoucherStatus } from '../types';

/**
 * TODO: these become API calls. The signatures are already the shape those
 * calls take, so only the bodies change.
 */

export type VoucherAction =
  | 'submit'
  | 'approve'
  | 'reject'
  | 'post'
  | 'cancel';

const NEXT_STATUS: Record<VoucherAction, VoucherStatus> = {
  submit: 'Pending Approval',
  approve: 'Approved',
  reject: 'Rejected',
  post: 'Posted',
  cancel: 'Cancelled',
};

export function applyAction(
  voucher: VoucherRecord,
  action: VoucherAction,
  user: PortalUser,
  reason?: string,
): VoucherRecord {
  const now = new Date().toISOString();
  const actor = { id: user.id, name: user.name };

  const base = { ...voucher, status: NEXT_STATUS[action] };

  switch (action) {
    case 'submit':
      // Resubmitting a rejected voucher clears the old reason — otherwise
      // the approver reads last round's objection against this round's entry.
      return {
        ...base,
        submittedAt: now,
        decidedBy: null,
        decidedAt: null,
        rejectionReason: null,
      };

    case 'approve':
      return { ...base, decidedBy: actor, decidedAt: now, rejectionReason: null };

    case 'reject':
      return {
        ...base,
        decidedBy: actor,
        decidedAt: now,
        rejectionReason: reason?.trim() || 'No reason given.',
      };

    case 'post':
      return { ...base, postedAt: now };

    case 'cancel':
      return { ...base, decidedBy: actor, decidedAt: now };
  }
}

export function isOpen(status: VoucherStatus): boolean {
  return status === 'Draft' || status === 'Pending Approval';
}

export const STATUS_MEANING: Record<VoucherStatus, string> = {
  Draft: 'Not yet submitted. Visible only as a working entry.',
  'Pending Approval': 'Waiting on an approver. Has not reached the ledger.',
  Approved: 'Approved but not yet posted to the ledger.',
  Rejected: 'Sent back to the drafter. Can be corrected and resubmitted.',
  Posted: 'Posted to the ledger. This entry affects official records.',
  Cancelled: 'Withdrawn. Kept for the audit trail, excluded from all totals.',
};
