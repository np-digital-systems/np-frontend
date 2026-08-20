/**
 * Portal routes for the events module.
 *
 * The public website already owns `/events` for its visitor-facing calendar,
 * so the portal's event screens sit under their own prefix. Kept in one
 * place because the sidebar, the breadcrumbs and the dashboard shortcuts all
 * have to agree on it.
 */
export const EVENT_ROUTES = {
  calendar: '/event-management',
  types: '/event-management/types',
  schedule: '/event-management/schedule',
  sponsors: '/event-management/sponsors',
} as const;
