import type { UserRole } from './user-role';

export interface PortalUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;

  /** Initials shown in the avatar when no photo is set. */
  readonly initials: string;
}
