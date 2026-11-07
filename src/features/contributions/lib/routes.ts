export const CONTRIBUTION_ROUTES = {
  members: '/contributions/members',
  sanththa: '/contributions/sanththa',
  collections: '/contributions/collections',
} as const;

export function collectionSheetHref(eventId: number): string {
  return `${CONTRIBUTION_ROUTES.collections}/${eventId}`;
}
