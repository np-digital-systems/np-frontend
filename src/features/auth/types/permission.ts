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

  /*
   * Vouchers.
   *
   * Receipts and payments are split because the temple treats them
   * differently — money coming in is counted at the hundial by whoever is on
   * duty, money going out commits the temple to a payee. The workflow verbs
   * (submit, approve, post) are shared: they act on a voucher of either kind.
   */
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

  /*
   * Financial management.
   *
   * The line drawn here is the same one the accounting module draws: keeping
   * the books is the accountant's, committing the temple's money or its
   * property is the administrator's. So an accountant defines funds and
   * projects and capitalises an asset, while placing a fixed deposit or
   * writing an asset off stays with the admin.
   */
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

  // Events
  //
  // Split rather than one `event:manage` umbrella: an accountant needs the
  // calendar and a schedule export without any ability to change what the
  // temple has committed to, and a cashier needs to see who is sponsoring a
  // pooja without reaching the sponsor directory's contact details.
  'event:view',
  'event:create',
  'event:update',
  'event:delete',
  'event:complete',
  'event:export',

  'event-type:manage',

  // The yearly planning view is temple-staff work; a devotee stops at the
  // calendar itself.
  'event-schedule:view',

  'event-sponsor:view',
  'event-sponsor:manage',

  /*
   * Temple contributions.
   *
   * Sanththa is the members' subscription register. A cashier takes the
   * money at the counter, so recording a payment is theirs; who is on the
   * register at all is the temple's own record-keeping.
   */
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
