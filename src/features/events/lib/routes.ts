export const EVENT_ROUTES = {
  calendar: '/event-management',
  types: '/event-management/types',
  schedule: '/event-management/schedule',
  sponsors: '/event-management/sponsors',
  costings: '/event-management/costings',
} as const;

export function costingRoute(costingId: number): string {
  return `${EVENT_ROUTES.costings}/${costingId}`;
}

export function costingHistoryRoute(costingId: number): string {
  return `${EVENT_ROUTES.costings}/${costingId}/history`;
}

export function eventBudgetRoute(eventId: number): string {
  return `${EVENT_ROUTES.costings}/budget/${eventId}`;
}
