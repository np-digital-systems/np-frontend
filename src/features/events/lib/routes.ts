export const EVENT_ROUTES = {
  calendar: '/event-management',
  types: '/event-management/types',
  schedule: '/event-management/schedule',
  sponsors: '/event-management/sponsors',
  costings: '/event-management/costings',
} as const;

/** The line editor for one costing version. */
export function costingRoute(costingId: number): string {
  return `${EVENT_ROUTES.costings}/${costingId}`;
}

/** What one occurrence was quoted at, against what it actually cost. */
export function eventBudgetRoute(eventId: number): string {
  return `${EVENT_ROUTES.costings}/budget/${eventId}`;
}
