import { can } from '@/features/auth/lib/permissions';
import type { UserRole } from '@/features/auth/types/user-role';

export interface EventAccess {
  readonly canView: boolean;

  readonly canCreate: boolean;
  readonly canUpdate: boolean;
  readonly canDelete: boolean;
  readonly canComplete: boolean;
  readonly canExport: boolean;

  readonly canManageTypes: boolean;

    readonly canViewSchedule: boolean;

  readonly canViewSponsors: boolean;
  readonly canManageSponsors: boolean;

    readonly canWrite: boolean;

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

export const READ_ONLY_MESSAGE =
  'You have view access to the temple calendar. Creating, editing and deleting events is restricted to administrators.';
