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

// No search history is stored yet, so the palette opens with quick actions only.
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
