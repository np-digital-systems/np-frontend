/**
 * The search vocabulary the palette renders.
 *
 * Results come from the API through `lib/search-service`, scoped there by the
 * permission guarding each source. What stays here is the shape of a result,
 * the type filters, and the quick actions the palette offers when nothing has
 * been typed yet.
 */

export type SearchType =
  | 'User' | 'Event' | 'Receipt' | 'Payment' | 'Transaction'
  | 'Fund' | 'Project' | 'Fixed Deposit' | 'Asset' | 'Sanththa'
  | 'Financial Year' | 'Report'

export interface SearchResult {
  id: string
  type: SearchType
  title: string
  subtitle: string
  meta?: string
  ref?: string
  badge?: string
  page: string
  keywords: string[]
}

export interface QuickAction {
  label: string
  shortcut?: string
  page: string
  icon: string
}

export const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Create Receipt',    page: 'Receipt Vouchers', icon: 'receipt' },
  { label: 'Create Payment',    page: 'Payment Vouchers', icon: 'payment' },
  { label: 'Create User',       page: 'Roles & Permissions', icon: 'user' },
  { label: 'Create Event',      page: 'Event Calendar', icon: 'event' },
  { label: 'Open Cash Book',    page: 'Cash Book', icon: 'cash' },
  { label: 'Open Reports',      page: 'Reports', icon: 'report' },
]

/**
 * Nothing remembers a visitor's searches yet, so the palette opens with the
 * quick actions alone rather than somebody else's history.
 */
export const RECENT_SEARCHES: string[] = []

export const RECENTLY_VIEWED: { label: string; type: SearchType; page: string }[] = []

export const TYPE_FILTERS: (SearchType | 'All')[] = [
  'All', 'User', 'Event', 'Receipt', 'Payment', 'Transaction',
  'Fund', 'Project', 'Fixed Deposit', 'Asset', 'Sanththa', 'Financial Year', 'Report',
]

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning'

export const BADGE_TONE: Record<string, BadgeTone> = {
  Active: 'success',
  Posted: 'success',
  Paid: 'success',
  Open: 'success',
  Completed: 'success',
  Upcoming: 'info',
  Planned: 'info',
  Setup: 'info',
  'In Progress': 'info',
  'Pending Approval': 'warning',
  Outstanding: 'warning',
  Inactive: 'neutral',
  Closed: 'neutral',
}

export interface SearchGroup {
  readonly type: SearchType
  readonly items: readonly SearchResult[]
}

/** Group results by kind, in the order the palette lists its filters. */
export function groupResults(
  results: readonly SearchResult[],
): readonly SearchGroup[] {
  const groups = new Map<SearchType, SearchResult[]>()

  for (const result of results) {
    const bucket = groups.get(result.type)

    if (bucket) bucket.push(result)
    else groups.set(result.type, [result])
  }

  return [...groups.entries()].map(([type, items]) => ({ type, items }))
}
