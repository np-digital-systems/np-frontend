import { can } from '@/features/auth/lib/permissions';
import type { Permission } from '@/features/auth/types/permission';

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

export function getEventAccess(granted: readonly Permission[]): EventAccess {
  const canCreate = can(granted, 'event:create');
  const canUpdate = can(granted, 'event:update');
  const canDelete = can(granted, 'event:delete');
  const canManageSponsors = can(granted, 'event-sponsor:manage');

  return {
    canView: can(granted, 'event:view'),

    canCreate,
    canUpdate,
    canDelete,
    canComplete: can(granted, 'event:complete'),
    canExport: can(granted, 'event:export'),

    canManageTypes: can(granted, 'event-type:manage'),

    canViewSchedule: can(granted, 'event-schedule:view'),

    canViewSponsors: can(granted, 'event-sponsor:view'),
    canManageSponsors,

    canWrite: canCreate || canUpdate || canDelete,
    canSeeSponsorContact: canManageSponsors,
  };
}

export const READ_ONLY_MESSAGE =
  'You have view access to the temple calendar. Creating, editing and deleting events is restricted to administrators.';
