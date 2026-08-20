import { can } from '@/features/auth/lib/permissions';
import type { UserRole } from '@/features/auth/types/user-role';

/**
 * What the signed-in role may do on the events screens.
 *
 * Resolved once, on the server, at each page boundary and passed down as
 * plain booleans. Components never receive a role and never call `can`
 * themselves — so "who can delete an event" is answered by reading this
 * file, not by grepping for conditionals across a dozen components.
 */
export interface EventAccess {
  readonly canView: boolean;

  readonly canCreate: boolean;
  readonly canUpdate: boolean;
  readonly canDelete: boolean;
  readonly canComplete: boolean;
  readonly canExport: boolean;

  readonly canManageTypes: boolean;

  /** The yearly planning view — temple staff, not devotees. */
  readonly canViewSchedule: boolean;

  readonly canViewSponsors: boolean;
  readonly canManageSponsors: boolean;

  /** True when any write path is open — drives the read-only banner. */
  readonly canWrite: boolean;

  /** Contact details belong to whoever administers the sponsor records. */
  readonly canSeeSponsorContact: boolean;
}

export function getEventAccess(role: UserRole): EventAccess {
  const canCreate = can(role, 'event:create');
  const canUpdate = can(role, 'event:update');
  const canDelete = can(role, 'event:delete');
  const canManageSponsors = can(role, 'event-sponsor:manage');

  return {
    canView: can(role, 'event:view'),

    canCreate,
    canUpdate,
    canDelete,
    canComplete: can(role, 'event:complete'),
    canExport: can(role, 'event:export'),

    canManageTypes: can(role, 'event-type:manage'),

    canViewSchedule: can(role, 'event-schedule:view'),

    canViewSponsors: can(role, 'event-sponsor:view'),
    canManageSponsors,

    canWrite: canCreate || canUpdate || canDelete,
    canSeeSponsorContact: canManageSponsors,
  };
}

/** The one line a read-only role sees in place of the action buttons. */
export const READ_ONLY_MESSAGE =
  'You have view access to the temple calendar. Creating, editing and deleting events is restricted to administrators.';
