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

  // Administration
  'user:manage',
  'audit:view',
  'settings:manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
