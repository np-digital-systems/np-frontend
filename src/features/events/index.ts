/**
 * Events feature — public surface.
 *
 * Routes mount the four feature boundaries below; everything else is an
 * implementation detail of this folder. The boundaries are server
 * components: they resolve identity, capabilities and data before any
 * client code runs.
 */
export {
  EventsCalendarFeature,
  EventTypesFeature,
  YearlyScheduleFeature,
  SponsorsFeature,
} from './sections';

export { getEventAccess, type EventAccess } from './lib/event-access';

export {
  getEvents,
  getEventTypes,
  getScheduleGroups,
  getSponsorAssignments,
  getSponsorUsers,
} from './lib/event-service';

export {
  FREQUENCY_LABELS,
  FREQUENCY_TYPES,
  INSTANCE_MEANING,
  describeInstance,
  formatEventDate,
  formatTimeRange,
  getActiveYear,
  getToday,
} from './lib/event-data';

export type {
  EventRecord,
  EventType,
  EventTypeRecord,
  EventTypeSponsor,
  EventsSummary,
  FrequencyType,
  ScheduleGroup,
  ScheduleSlot,
  SponsorAssignment,
  SponsorUser,
  TempleEvent,
} from './types';
