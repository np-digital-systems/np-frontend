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

export const SEARCH_INDEX: SearchResult[] = [
  // ── Users ──
  { id: 'u1', type: 'User', title: 'K. Keeththigan', subtitle: 'ADMIN · 077 111 0001', meta: 'Active', page: 'Users', keywords: ['keeththigan', 'admin', '0771110001', 'user'] },
  { id: 'u2', type: 'User', title: 'A. Suresh', subtitle: 'ACCOUNTANT · 077 111 0002', meta: 'Active', page: 'Users', keywords: ['suresh', 'accountant', '0771110002', 'user'] },
  { id: 'u3', type: 'User', title: 'K. Kumar', subtitle: 'CASHIER · 077 111 0003', meta: 'Active', page: 'Users', keywords: ['kumar', 'cashier', '0771110003', 'user'] },
  { id: 'u4', type: 'User', title: 'M. Ganesan', subtitle: 'DEVOTEE · 077 123 4567', meta: 'Active', page: 'Users', keywords: ['ganesan', 'devotee', '0771234567', 'user'] },
  { id: 'u5', type: 'User', title: 'S. Rajan', subtitle: 'DEVOTEE · 077 987 6543', meta: 'Inactive', page: 'Users', keywords: ['rajan', 'devotee', '0779876543', 'user'] },
  { id: 'u6', type: 'User', title: 'P. Sivarajah', subtitle: 'DEVOTEE · 077 555 1234', meta: 'Active', page: 'Users', keywords: ['sivarajah', 'devotee', 'user'] },

  // ── Events ──
  { id: 'e1', type: 'Event', title: 'Navarathiri 2026', ref: 'EVT-2026-001', subtitle: '01 Oct – 09 Oct 2026 · Festival Fund', badge: 'Upcoming', page: 'Event Calendar', keywords: ['navarathiri', 'festival', '2026', 'oct', 'event'] },
  { id: 'e2', type: 'Event', title: 'Annual Festival 2026', ref: 'EVT-2026-002', subtitle: '15 Nov – 17 Nov 2026 · Festival Fund', badge: 'Planned', page: 'Event Calendar', keywords: ['annual', 'festival', '2026', 'nov', 'event'] },
  { id: 'e3', type: 'Event', title: 'Thai Pongal 2026', ref: 'EVT-2026-003', subtitle: '14 Jan 2026 · General Temple Fund', badge: 'Completed', page: 'Event Calendar', keywords: ['pongal', 'thai', '2026', 'jan', 'event'] },
  { id: 'e4', type: 'Event', title: 'Mahasivarathiri 2026', ref: 'EVT-2026-004', subtitle: '26 Feb 2026 · Festival Fund', badge: 'Completed', page: 'Event Calendar', keywords: ['mahasivarathiri', 'siva', '2026', 'event'] },

  // ── Receipts ──
  { id: 'rv1', type: 'Receipt', title: 'RV-2026-0125', ref: 'RB-04-125', subtitle: 'M. Ganesan · Rs. 25,000', badge: 'Posted', page: 'Receipt Vouchers', keywords: ['rv-2026-0125', 'rb-04-125', 'ganesan', '25000', 'receipt'] },
  { id: 'rv2', type: 'Receipt', title: 'RV-2026-0124', ref: 'RB-04-124', subtitle: 'P. Sivarajah · Rs. 5,000', badge: 'Posted', page: 'Receipt Vouchers', keywords: ['rv-2026-0124', 'sivarajah', '5000', 'receipt', 'sanththa'] },
  { id: 'rv3', type: 'Receipt', title: 'RV-2026-0042', ref: 'RB-03-042', subtitle: 'M. Ganesan · Rs. 5,000 · Sanththa', badge: 'Posted', page: 'Receipt Vouchers', keywords: ['rv-2026-0042', 'rb-03-042', 'ganesan', '5000', 'sanththa', 'receipt'] },
  { id: 'rv4', type: 'Receipt', title: 'RV-2026-0421', ref: 'RB-04-421', subtitle: 'K. Selvan · Rs. 10,000 · Navarathiri', badge: 'Posted', page: 'Receipt Vouchers', keywords: ['rv-2026-0421', 'selvan', '10000', 'navarathiri', 'receipt'] },

  // ── Payments ──
  { id: 'pv1', type: 'Payment', title: 'PV-2026-0074', ref: 'PV Book 02/81', subtitle: 'ABC Construction · Rs. 150,000', badge: 'Posted', meta: 'Rajagopuram Thiruppani', page: 'Payment Vouchers', keywords: ['pv-2026-0074', 'abc', 'construction', '150000', 'payment', 'rajagopuram'] },
  { id: 'pv2', type: 'Payment', title: 'PV-2026-0073', ref: 'PV Book 02/80', subtitle: 'E. Silva · Rs. 45,000', badge: 'Pending Approval', meta: 'Generator Maintenance', page: 'Payment Vouchers', keywords: ['pv-2026-0073', 'silva', '45000', 'payment', 'generator'] },
  { id: 'pv3', type: 'Payment', title: 'PV-2026-0318', ref: 'PV Book 01/318', subtitle: 'Electricity Board · Rs. 18,500', badge: 'Posted', meta: 'Temple Operations', page: 'Payment Vouchers', keywords: ['pv-2026-0318', 'electricity', '18500', 'payment', 'operations'] },

  // ── Transactions ──
  { id: 'txn1', type: 'Transaction', title: 'TXN-2026-00385', subtitle: 'Rs. 25,000 · Festival Fund', badge: 'Posted', meta: 'Navarathiri 2026', page: 'Transactions', keywords: ['txn-2026-00385', '25000', 'festival', 'navarathiri', 'transaction'] },
  { id: 'txn2', type: 'Transaction', title: 'TXN-2026-00386', subtitle: 'Rs. 150,000 · Thiruppani Fund', badge: 'Posted', meta: 'Rajagopuram Thiruppani', page: 'Transactions', keywords: ['txn-2026-00386', '150000', 'thiruppani', 'rajagopuram', 'transaction'] },
  { id: 'txn3', type: 'Transaction', title: 'TXN-2026-00142', subtitle: 'Rs. 5,000 · General Fund', badge: 'Posted', meta: 'Sanththa Income', page: 'Transactions', keywords: ['txn-2026-00142', '5000', 'sanththa', 'general', 'transaction'] },

  // ── Funds ──
  { id: 'f1', type: 'Fund', title: 'General Temple Fund', ref: 'GENERAL', subtitle: 'FY 2026 · Rs. 1,240,000', badge: 'Active', page: 'Funds', keywords: ['general', 'temple', 'fund', '2026'] },
  { id: 'f2', type: 'Fund', title: 'Festival Fund', ref: 'FESTIVAL', subtitle: 'FY 2026 · Rs. 2,850,000', badge: 'Active', page: 'Funds', keywords: ['festival', 'fund', '2026'] },
  { id: 'f3', type: 'Fund', title: 'Thiruppani Fund', ref: 'THIRUPPANI', subtitle: 'FY 2026 · Rs. 4,200,000', badge: 'Active', page: 'Funds', keywords: ['thiruppani', 'fund', '2026'] },

  // ── Projects ──
  { id: 'p1', type: 'Project', title: 'Rajagopuram Thiruppani', subtitle: 'Thiruppani Fund · 2026', badge: 'In Progress', meta: 'Rs. 4,200,000 budget', page: 'Projects', keywords: ['rajagopuram', 'thiruppani', 'project', '2026'] },
  { id: 'p2', type: 'Project', title: 'Main Temple Renovation', subtitle: 'Thiruppani Fund · 2026', badge: 'In Progress', meta: 'Rs. 1,800,000 budget', page: 'Projects', keywords: ['main', 'temple', 'renovation', 'project', '2026'] },
  { id: 'p3', type: 'Project', title: 'Temple Operations 2026', subtitle: 'General Temple Fund · 2026', badge: 'Active', page: 'Projects', keywords: ['operations', 'project', '2026', 'general'] },

  // ── Fixed Deposits ──
  { id: 'fd1', type: 'Fixed Deposit', title: 'FD-2026-001', subtitle: "People's Bank · Rs. 5,000,000", badge: 'Active', meta: 'Matures 9 Sep 2027 · 7.75%', page: 'Fixed Deposits', keywords: ['fd-2026-001', "people's bank", '5000000', 'fixed deposit'] },
  { id: 'fd2', type: 'Fixed Deposit', title: 'FD-2026-002', subtitle: 'Bank of Ceylon · Rs. 2,000,000', badge: 'Active', meta: 'Matures 15 Dec 2026 · 7.25%', page: 'Fixed Deposits', keywords: ['fd-2026-002', 'bank of ceylon', '2000000', 'fixed deposit'] },

  // ── Assets ──
  { id: 'a1', type: 'Asset', title: 'Temple Generator', ref: 'AST-2026-001', subtitle: 'Main Temple · Rs. 700,000', badge: 'Active', page: 'Assets', keywords: ['generator', 'ast-2026-001', 'asset', 'main temple'] },
  { id: 'a2', type: 'Asset', title: 'Sound System', ref: 'AST-2026-002', subtitle: 'Main Hall · Rs. 180,000', badge: 'Active', page: 'Assets', keywords: ['sound system', 'ast-2026-002', 'asset', 'hall'] },
  { id: 'a3', type: 'Asset', title: 'Temple Vehicle', ref: 'AST-2026-003', subtitle: 'Garage · Rs. 2,800,000', badge: 'Active', page: 'Assets', keywords: ['vehicle', 'ast-2026-003', 'asset', 'garage'] },

  // ── Sanththa ──
  { id: 's1', type: 'Sanththa', title: 'M. Ganesan — 2026 Sanththa', subtitle: 'Rs. 5,000 · Paid', badge: 'Paid', ref: 'RV-2026-0042', page: 'Sanththa', keywords: ['ganesan', 'sanththa', '2026', 'paid', '5000'] },
  { id: 's2', type: 'Sanththa', title: 'K. Kumar — 2026 Sanththa', subtitle: 'Rs. 5,000 · Paid', badge: 'Paid', ref: 'RV-2026-0088', page: 'Sanththa', keywords: ['kumar', 'sanththa', '2026', 'paid', '5000'] },
  { id: 's3', type: 'Sanththa', title: 'P. Sivarajah — 2026 Sanththa', subtitle: 'Rs. 5,000 · Outstanding', badge: 'Outstanding', page: 'Sanththa', keywords: ['sivarajah', 'sanththa', '2026', 'outstanding'] },

  // ── Financial Years ──
  { id: 'fy1', type: 'Financial Year', title: '2026', subtitle: '01 Jan 2026 – 31 Dec 2026', badge: 'Open', page: 'Financial Years', keywords: ['2026', 'financial year', 'open'] },
  { id: 'fy2', type: 'Financial Year', title: '2025', subtitle: '01 Jan 2025 – 31 Dec 2025', badge: 'Closed', page: 'Financial Years', keywords: ['2025', 'financial year', 'closed'] },
  { id: 'fy3', type: 'Financial Year', title: '2027', subtitle: '01 Jan 2027 – 31 Dec 2027', badge: 'Setup', page: 'Financial Years', keywords: ['2027', 'financial year', 'setup'] },

  // ── Reports ──
  { id: 'rp1', type: 'Report', title: 'Navarathiri 2026 Financial Report', subtitle: 'Event Report · Festival Fund', page: 'Reports', keywords: ['navarathiri', 'report', 'festival', '2026'] },
  { id: 'rp2', type: 'Report', title: 'Festival Fund Report 2026', subtitle: 'Fund Report · 2026', page: 'Reports', keywords: ['festival', 'fund', 'report', '2026'] },
  { id: 'rp3', type: 'Report', title: 'Income & Expenditure 2026', subtitle: 'Overview Report · 2026', page: 'Reports', keywords: ['income', 'expenditure', 'report', '2026', 'overview'] },
  { id: 'rp4', type: 'Report', title: 'Sanththa Collection Report 2026', subtitle: 'Sanththa Report · 2026', page: 'Reports', keywords: ['sanththa', 'collection', 'report', '2026'] },
]

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

export const RECENT_SEARCHES = ['M. Ganesan', 'RV-2026-0125', 'Navarathiri 2026', 'Rajagopuram Thiruppani']

export const RECENTLY_VIEWED: { label: string; type: SearchType; page: string }[] = [
  { label: 'M. Ganesan',          type: 'User',         page: 'Users' },
  { label: 'PV-2026-0074',        type: 'Payment',      page: 'Payment Vouchers' },
  { label: 'Festival Fund',        type: 'Fund',         page: 'Funds' },
  { label: 'FD-2026-001',         type: 'Fixed Deposit', page: 'Fixed Deposits' },
  { label: 'Navarathiri 2026',    type: 'Event',        page: 'Event Calendar' },
]

export const TYPE_FILTERS: (SearchType | 'All')[] = [
  'All', 'User', 'Event', 'Receipt', 'Payment', 'Transaction',
  'Fund', 'Project', 'Fixed Deposit', 'Asset', 'Sanththa', 'Financial Year', 'Report',
]

export const TYPE_ICON: Record<SearchType, string> = {
  User:           '👤',
  Event:          '🗓',
  Receipt:        '🧾',
  Payment:        '💳',
  Transaction:    '↔',
  Fund:           '🏛',
  Project:        '📐',
  'Fixed Deposit':'🏦',
  Asset:          '📦',
  Sanththa:       '🙏',
  'Financial Year':'📅',
  Report:         '📊',
}

export const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Active:          { bg: 'rgba(52,199,89,0.10)',  text: '#34C759' },
  Posted:          { bg: 'rgba(52,199,89,0.10)',  text: '#34C759' },
  Paid:            { bg: 'rgba(52,199,89,0.10)',  text: '#34C759' },
  Open:            { bg: 'rgba(52,199,89,0.10)',  text: '#34C759' },
  Completed:       { bg: 'rgba(52,199,89,0.10)',  text: '#34C759' },
  Upcoming:        { bg: 'rgba(0,113,227,0.10)',  text: '#0071E3' },
  Planned:         { bg: 'rgba(0,113,227,0.10)',  text: '#0071E3' },
  Setup:           { bg: 'rgba(0,113,227,0.10)',  text: '#0071E3' },
  'In Progress':   { bg: 'rgba(0,113,227,0.10)',  text: '#0071E3' },
  'Pending Approval': { bg: 'rgba(255,159,10,0.10)', text: '#FF9F0A' },
  Outstanding:     { bg: 'rgba(255,159,10,0.10)', text: '#FF9F0A' },
  Inactive:        { bg: 'var(--surface-2)',       text: 'var(--text-muted)' },
  Closed:          { bg: 'var(--surface-2)',       text: 'var(--text-muted)' },
}

export function searchIndex(query: string, typeFilter: SearchType | 'All'): SearchResult[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return SEARCH_INDEX.filter(item => {
    if (typeFilter !== 'All' && item.type !== typeFilter) return false
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      (item.ref?.toLowerCase().includes(q) ?? false) ||
      (item.meta?.toLowerCase().includes(q) ?? false) ||
      item.keywords.some(k => k.includes(q))
    )
  }).slice(0, 24)
}

export function groupResults(results: SearchResult[]): { type: SearchType; items: SearchResult[] }[] {
  const order: SearchType[] = ['User','Event','Receipt','Payment','Transaction','Fund','Project','Fixed Deposit','Asset','Sanththa','Financial Year','Report']
  const map = new Map<SearchType, SearchResult[]>()
  for (const r of results) {
    if (!map.has(r.type)) map.set(r.type, [])
    map.get(r.type)!.push(r)
  }
  return order
    .filter(t => map.has(t))
    .map(t => ({ type: t, items: map.get(t)! }))
}
