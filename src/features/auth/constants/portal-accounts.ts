import type { PortalUser } from '../types/user';
import type { UserRole } from '../types/user-role';

/**
 * One demo account per role, mirroring the corresponding entry in the
 * administration user register.
 *
 * TODO: this table disappears the moment the sign-in API exists — the account
 * will then come back from the server together with the session. Until then it
 * is what both the sign-in screen and `getCurrentUser` resolve against, so the
 * portal shows the same identity the login page promised.
 */
export interface PortalAccount extends PortalUser {
  readonly nameTa: string;
}

export const PORTAL_ACCOUNTS = {
  admin: {
    id: 'usr_001',
    name: 'K. Suresh',
    nameTa: 'கு. சுரேஷ்',
    email: 'suresh@neeliyampathipillaiyarkovil.com',
    role: 'admin',
    initials: 'KS',
  },

  accountant: {
    id: 'usr_009',
    name: 'S. Vijayan',
    nameTa: 'சி. விஜயன்',
    email: 'vijayan@neeliyampathipillaiyarkovil.com',
    role: 'accountant',
    initials: 'SV',
  },

  cashier: {
    id: 'usr_014',
    name: 'R. Murugan',
    nameTa: 'ரா. முருகன்',
    email: 'murugan@neeliyampathipillaiyarkovil.com',
    role: 'cashier',
    initials: 'RM',
  },

  user: {
    id: 'usr_021',
    name: 'A. Shanmugam',
    nameTa: 'அ. சண்முகம்',
    email: 'shanmugam@example.com',
    role: 'user',
    initials: 'AS',
  },
} as const satisfies Record<UserRole, PortalAccount>;
