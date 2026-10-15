export const CONTRIBUTION_ROUTES = {
  sponsors: '/contributions/sponsors',
  sanththa: '/contributions/sanththa',
  collections: '/contributions/collections',
} as const;

export function collectionSheetHref(eventId: number): string {
  return `${CONTRIBUTION_ROUTES.collections}/${eventId}`;
}
