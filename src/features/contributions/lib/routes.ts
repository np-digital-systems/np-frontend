export const CONTRIBUTION_ROUTES = {
  sponsors: '/contributions/sponsors',
  sanththa: '/contributions/sanththa',
  collections: '/contributions/collections',
} as const;

/** The collection sheet for one dated occurrence. */
export function collectionSheetHref(eventId: number): string {
  return `${CONTRIBUTION_ROUTES.collections}/${eventId}`;
}
