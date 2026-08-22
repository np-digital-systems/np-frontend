import type { UserRole } from './user-role';

export interface PortalUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;

    readonly initials: string;
}
