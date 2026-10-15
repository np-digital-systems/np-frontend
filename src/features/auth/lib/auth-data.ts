import type { AuthRoleIcon } from '../types/auth';
import type { UserRole } from '../types/user-role';

// The single source for role names and descriptions; other features import them from here.
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  accountant: 'Accountant',
  cashier: 'Cashier',
  member: 'Member',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full control of the temple’s records, money and portal settings.',
  accountant:
    'Keeps the books: approves and posts entries, manages funds, generates statements.',
  cashier:
    'Takes money at the counter: drafts receipts and payments and submits them for approval.',
  member: 'A sponsor or devotee using the portal. Sees their own record and the calendar.',
};

interface RolePresentation {
  readonly icon: AuthRoleIcon;

  /** Short form for tiles. */
  readonly summary: string;

  readonly highlights: readonly string[];
}

export const ROLE_PRESENTATION: Record<UserRole, RolePresentation> = {
  admin: {
    icon: 'shield',
    summary: 'Everything the temple keeps, plus who may keep it.',
    highlights: ['Users & roles', 'Financial years', 'Audit trail'],
  },

  accountant: {
    icon: 'ledger',
    summary: 'The ledger, the approval chain and the statements.',
    highlights: ['Approve & post', 'Funds & projects', 'Reports'],
  },

  cashier: {
    icon: 'counter',
    summary: 'The counter: take money in, write payments out.',
    highlights: ['Receipts', 'Payments', 'Cash book'],
  },

  member: {
    icon: 'devotee',
    summary: 'The temple calendar, and nothing behind it.',
    highlights: ['Event calendar', 'Personal profile'],
  },
};
