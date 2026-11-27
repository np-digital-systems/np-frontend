export const PERMISSIONS = [
  'dashboard:view',

  // Accounting — the chart of accounts and the posted ledger
  'account:view',
  'account:manage',
  'activity:view',
  'activity:manage',
  'party:view',
  'party:manage',

  'transaction:view',
  'transaction:create',
  'transaction:export',

  // Vouchers: receipts and payments are separate permissions; submit/approve/post apply to both.
  'receipt-voucher:view',
  'receipt-voucher:create',

  'payment-voucher:view',
  'payment-voucher:create',

  'voucher:create',
  'voucher:submit',
  'voucher:approve',
  'voucher:post',
  'voucher:journal',

    'voucher:manage-all',

  'cash-book:view',
  'bank-book:view',

  'bank-account:view',
  'bank-account:manage',

  // Finance: accountants keep the books; committing money or property (deposits, write-offs) is admin-only.
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

  // Events: split so roles can view or export without editing, or see sponsors without contact details.
  'event:view',
  'event:create',
  'event:update',
  'event:delete',
  'event:complete',
  'event:export',

  'event-type:manage',

  // Staff only; devotees see the calendar alone.
  'event-schedule:view',

  'event-sponsor:view',
  'event-sponsor:manage',

  'event-costing:view',
  'event-costing:manage',

  // Contributions: cashiers record payments; managing the member register is separate.
  'sponsor:view',
  'sponsor:manage',
  'contribution:view',
  'contribution:record',
  'contribution:manage',

  // Administration
  'user:manage',

  'role:manage',

  'financial-year:view',
    'financial-year:manage',

  'audit:view',
  'settings:manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
