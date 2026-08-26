/**
 * The notification vocabulary the screens render.
 *
 * The notifications themselves come from the API through
 * `lib/notification-service`; what stays here is the shape of one, the tone
 * each priority is shown in, and the tabs the inbox offers.
 */

export type NotificationCategory =
  | 'Approval' | 'Accounting' | 'Event' | 'Sanththa'
  | 'Banking' | 'Fixed Deposit' | 'Financial Year' | 'User Administration' | 'Security' | 'System'

export type NotificationPriority = 'Information' | 'Reminder' | 'Warning' | 'Critical'

export interface Notification {
  id: string
  category: NotificationCategory
  priority: NotificationPriority
  title: string
  message: string
  entityType?: string
  entityRef?: string
  actionLabel?: string
  actionPage?: string
  timestamp: string   // ISO-like "2026-08-12T11:30"
  read: boolean
  dismissible: boolean
  // optional extras displayed in detail
  meta?: { label: string; value: string }[]
}

export const PRIORITY_TONE: Record<NotificationPriority, 'neutral' | 'info' | 'warning' | 'danger'> = {
  Information: 'neutral',
  Reminder: 'info',
  Warning: 'warning',
  Critical: 'danger',
}

export const CATEGORY_TABS = ['All', 'Unread', 'Approvals', 'Accounting', 'Events', 'System'] as const

export type CategoryTab = typeof CATEGORY_TABS[number]

export function relativeTime(ts: string): string {
  const then = new Date(ts).getTime()
  const now = new Date('2026-08-12T12:00').getTime()
  const mins = Math.round((now - then) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`
  return `${Math.round(mins / 1440)}d ago`
}

export interface NotifPreference {
  category: string
  label: string
  inApp: boolean
  email: boolean
}

export const DEFAULT_PREFERENCES: NotifPreference[] = [
  { category: 'Approval', label: 'Approvals', inApp: true, email: true },
  { category: 'Accounting', label: 'Accounting Alerts', inApp: true, email: true },
  { category: 'Event', label: 'Event Reminders', inApp: true, email: false },
  { category: 'Sanththa', label: 'Sanththa', inApp: true, email: false },
  { category: 'Fixed Deposit', label: 'Fixed Deposits', inApp: true, email: true },
  { category: 'Security', label: 'Security', inApp: true, email: true },
  { category: 'Financial Year', label: 'Financial Year', inApp: true, email: false },
  { category: 'System', label: 'System', inApp: true, email: false },
]
