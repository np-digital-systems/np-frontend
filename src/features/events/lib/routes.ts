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

/**
 * Every version this plan has had, read side by side.
 *
 * A page of its own rather than a dialog over the editor: a festival costing
 * runs to dozens of itemised lines, and a panel that has to scroll to show one
 * version cannot be compared against the next.
 */
export function costingHistoryRoute(costingId: number): string {
  return `${EVENT_ROUTES.costings}/${costingId}/history`;
}

/** What one occurrence was quoted at, against what it actually cost. */
export function eventBudgetRoute(eventId: number): string {
  return `${EVENT_ROUTES.costings}/budget/${eventId}`;
}
