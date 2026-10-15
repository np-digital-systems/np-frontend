import type { VoucherStatus } from '../types';

export const STATUS_MEANING: Record<VoucherStatus, string> = {
  Draft: 'Not yet submitted. Visible only as a working entry.',
  'Pending Approval': 'Waiting on an approver. Has not reached the ledger.',
  Approved: 'Approved but not yet posted to the ledger.',
  Rejected: 'Sent back to the drafter. Can be corrected and resubmitted.',
  Posted: 'Posted to the ledger. This entry affects official records.',
  Cancelled: 'Withdrawn. Kept for the audit trail, excluded from all totals.',
};
