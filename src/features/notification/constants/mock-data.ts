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

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'N001',
    category: 'Approval',
    priority: 'Reminder',
    title: '3 Receipts Awaiting Approval',
    message: 'RV-2026-0125, RV-2026-0126, and RV-2026-0127 have been submitted and require your review.',
    entityType: 'Receipt Vouchers',
    entityRef: 'RV-2026-0125',
    actionLabel: 'Review Approvals',
    actionPage: 'Approval Center',
    timestamp: '2026-08-12T11:30',
    read: false,
    dismissible: false,
    meta: [
      { label: 'Submitted By', value: 'K. Kumar' },
      { label: 'Total Amount', value: 'Rs. 62,500' },
    ],
  },
  {
    id: 'N002',
    category: 'Approval',
    priority: 'Reminder',
    title: 'Payment Awaiting Approval',
    message: 'Payment voucher PV-2026-0074 submitted by K. Kumar requires your approval.',
    entityType: 'Payment Voucher',
    entityRef: 'PV-2026-0074',
    actionLabel: 'Review Payment',
    actionPage: 'Approval Center',
    timestamp: '2026-08-12T10:45',
    read: false,
    dismissible: false,
    meta: [
      { label: 'Submitted By', value: 'K. Kumar' },
      { label: 'Amount', value: 'Rs. 15,000' },
    ],
  },
  {
    id: 'N003',
    category: 'Approval',
    priority: 'Information',
    title: 'Receipt Approved',
    message: 'Your receipt RV-2026-0124 has been approved and posted to accounting.',
    entityType: 'Receipt Voucher',
    entityRef: 'RV-2026-0124',
    actionLabel: 'View Receipt',
    actionPage: 'Receipt Vouchers',
    timestamp: '2026-08-12T10:12',
    read: false,
    dismissible: true,
    meta: [
      { label: 'Approved By', value: 'A. Suresh' },
      { label: 'Amount', value: 'Rs. 25,000' },
    ],
  },
  {
    id: 'N004',
    category: 'Approval',
    priority: 'Warning',
    title: 'Payment Rejected',
    message: 'Your payment voucher PV-2026-0072 was rejected. Supporting document missing.',
    entityType: 'Payment Voucher',
    entityRef: 'PV-2026-0072',
    actionLabel: 'View Payment',
    actionPage: 'Payment Vouchers',
    timestamp: '2026-08-11T14:00',
    read: true,
    dismissible: false,
    meta: [
      { label: 'Rejected By', value: 'K. Keeththigan' },
      { label: 'Reason', value: 'Supporting document missing' },
    ],
  },
  {
    id: 'N005',
    category: 'Financial Year',
    priority: 'Warning',
    title: 'Financial Year Closing Soon',
    message: '2026 ends in 30 days. 3 approvals and 2 unreconciled bank items remain outstanding.',
    entityType: 'Financial Year',
    entityRef: '2026',
    actionLabel: 'Review Year',
    actionPage: 'Financial Years',
    timestamp: '2026-08-12T09:00',
    read: false,
    dismissible: false,
    meta: [
      { label: 'Pending Approvals', value: '3' },
      { label: 'Unreconciled Items', value: '2' },
    ],
  },
  {
    id: 'N006',
    category: 'Fixed Deposit',
    priority: 'Reminder',
    title: 'FD Maturity in 30 Days',
    message: 'Fixed Deposit FD-2026-001 matures on 9 Sep 2026. Principal: Rs. 5,000,000.',
    entityType: 'Fixed Deposit',
    entityRef: 'FD-2026-001',
    actionLabel: 'View Fixed Deposit',
    actionPage: 'Fixed Deposits',
    timestamp: '2026-08-12T08:00',
    read: false,
    dismissible: true,
    meta: [
      { label: 'Principal', value: 'Rs. 5,000,000' },
      { label: 'Maturity Date', value: '9 Sep 2026' },
      { label: 'Interest Rate', value: '7.75%' },
    ],
  },
  {
    id: 'N007',
    category: 'Fixed Deposit',
    priority: 'Reminder',
    title: 'Interest Review Required',
    message: 'Interest for FD-2026-001 for July 2026 has not yet been recorded.',
    entityType: 'Fixed Deposit',
    entityRef: 'FD-2026-001',
    actionLabel: 'Review Interest',
    actionPage: 'Fixed Deposits',
    timestamp: '2026-08-11T09:00',
    read: true,
    dismissible: true,
    meta: [
      { label: 'Period', value: 'July 2026' },
    ],
  },
  {
    id: 'N008',
    category: 'Banking',
    priority: 'Reminder',
    title: 'Bank Reconciliation Pending',
    message: "People's Bank — Temple Account. Last reconciliation: 31 July 2026.",
    entityType: 'Bank Account',
    entityRef: "People's Bank",
    actionLabel: 'Review Bank Book',
    actionPage: 'Bank Book',
    timestamp: '2026-08-11T08:00',
    read: true,
    dismissible: false,
    meta: [
      { label: 'Account', value: "People's Bank — Temple Account" },
      { label: 'Last Reconciled', value: '31 Jul 2026' },
    ],
  },
  {
    id: 'N009',
    category: 'Accounting',
    priority: 'Critical',
    title: 'Cash Balance Verification Required',
    message: "Today's cash balance has not been verified. Please open the Cash Book to confirm.",
    entityType: 'Cash Book',
    entityRef: 'Cash',
    actionLabel: 'Open Cash Book',
    actionPage: 'Cash Book',
    timestamp: '2026-08-12T07:30',
    read: false,
    dismissible: false,
  },
  {
    id: 'N010',
    category: 'Sanththa',
    priority: 'Reminder',
    title: 'Sanththa Collection — 102 Outstanding',
    message: '102 members have not yet paid their 2026 Sanththa. Collected: Rs. 1,590,000. Outstanding: Rs. 510,000.',
    entityType: 'Sanththa',
    entityRef: '2026',
    actionLabel: 'View Sanththa',
    actionPage: 'Sanththa',
    timestamp: '2026-08-10T09:00',
    read: true,
    dismissible: true,
    meta: [
      { label: 'Collected', value: 'Rs. 1,590,000' },
      { label: 'Outstanding', value: 'Rs. 510,000' },
      { label: 'Outstanding Members', value: '102' },
    ],
  },
  {
    id: 'N011',
    category: 'Event',
    priority: 'Reminder',
    title: 'Navarathiri 2026 — 7 Days Away',
    message: 'Navarathiri 2026 begins on 19 Aug 2026. Review event finances and sponsorship status.',
    entityType: 'Event',
    entityRef: 'Navarathiri 2026',
    actionLabel: 'View Event',
    actionPage: 'Event Calendar',
    timestamp: '2026-08-12T08:30',
    read: false,
    dismissible: true,
    meta: [
      { label: 'Start Date', value: '19 Aug 2026' },
      { label: 'Duration', value: '9 days' },
    ],
  },
  {
    id: 'N012',
    category: 'Event',
    priority: 'Warning',
    title: 'Event Financial Warning — Navarathiri 2026',
    message: 'Current expenses (Rs. 470,000) exceed income (Rs. 450,000) for Navarathiri 2026.',
    entityType: 'Event',
    entityRef: 'Navarathiri 2026',
    actionLabel: 'Review Event',
    actionPage: 'Event Calendar',
    timestamp: '2026-08-11T16:00',
    read: true,
    dismissible: false,
    meta: [
      { label: 'Income', value: 'Rs. 450,000' },
      { label: 'Expenses', value: 'Rs. 470,000' },
      { label: 'Shortfall', value: 'Rs. 20,000' },
    ],
  },
  {
    id: 'N013',
    category: 'User Administration',
    priority: 'Information',
    title: 'Role Changed — M. Ganesan',
    message: 'M. Ganesan\'s role has been changed from DEVOTEE to CASHIER by K. Keeththigan.',
    entityType: 'User',
    entityRef: 'M. Ganesan',
    actionLabel: 'View User',
    actionPage: 'Roles & Permissions',
    timestamp: '2026-08-11T14:22',
    read: true,
    dismissible: true,
    meta: [
      { label: 'Previous Role', value: 'DEVOTEE' },
      { label: 'New Role', value: 'CASHIER' },
      { label: 'Changed By', value: 'K. Keeththigan' },
    ],
  },
  {
    id: 'N014',
    category: 'Security',
    priority: 'Warning',
    title: 'New Login Detected',
    message: 'A new login was detected on Chrome on MacBook at 12 Aug 2026, 10:32 AM.',
    entityType: 'Session',
    entityRef: 'Chrome / MacBook',
    actionLabel: 'View Sessions',
    actionPage: 'Roles & Permissions',
    timestamp: '2026-08-12T10:32',
    read: true,
    dismissible: true,
    meta: [
      { label: 'Device', value: 'MacBook Pro' },
      { label: 'Browser', value: 'Chrome' },
      { label: 'Time', value: '12 Aug 2026, 10:32 AM' },
    ],
  },
  {
    id: 'N015',
    category: 'System',
    priority: 'Information',
    title: 'New User Created',
    message: 'M. Ganesan was added to the system as a DEVOTEE.',
    entityType: 'User',
    entityRef: 'M. Ganesan',
    actionLabel: 'View User',
    actionPage: 'Roles & Permissions',
    timestamp: '2026-08-09T11:00',
    read: true,
    dismissible: true,
  },
]

/**
 * Priority expressed as a semantic tone, not a colour.
 *
 * The previous version hard-coded hex values and `var(--accent)` — which in
 * this token system is a subtle hover SURFACE, not a hue, so reminders came
 * out near-invisible. Components map the tone to theme classes themselves.
 */
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
