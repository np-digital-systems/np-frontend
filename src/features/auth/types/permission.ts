/**
 * Capability model.
 *
 * UI never branches on a role name directly — it asks whether the current
 * user *can do a thing*. Roles are an implementation detail of who gets
 * which capabilities, so re-mapping a role (or adding a new one) touches
 * this file and nothing else.
 */
export const PERMISSIONS = [
  'dashboard:view',

  // Accounting
  'transaction:view',
  'transaction:create',

  'voucher:create',
  'voucher:submit',
  'voucher:approve',

  'cash-book:view',
  'bank-book:view',

  // Financial management
  'fund:view',
  'fund:manage',

  'report:generate',

  // Events
  'event:view',
  'event:manage',

  // Administration
  'user:manage',
  'audit:view',
  'settings:manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
