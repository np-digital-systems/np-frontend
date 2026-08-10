import { BadgeStatus } from '../types';

export const MONTHLY_DATA = [
  { month: 'Mar', income: 285000, expenses: 142000 },
  { month: 'Apr', income: 310000, expenses: 198000 },
  { month: 'May', income: 245000, expenses: 156000 },
  { month: 'Jun', income: 520000, expenses: 312000 },
  { month: 'Jul', income: 380000, expenses: 224000 },
  { month: 'Aug', income: 190000, expenses: 89000 },
];

export const QUARTERLY_DATA = [
  { month: 'Q1', income: 820000, expenses: 465000 },
  { month: 'Q2', income: 1075000, expenses: 666000 },
  { month: 'Q3 (partial)', income: 570000, expenses: 313000 },
];

export const YEARLY_DATA = [
  { month: '2023', income: 2100000, expenses: 1380000 },
  { month: '2024', income: 2650000, expenses: 1720000 },
  { month: '2025', income: 3100000, expenses: 1980000 },
  { month: '2026 (YTD)', income: 2465000, expenses: 1444000 },
];

export const ADMIN_APPROVALS = [
  { ref: 'PV-2026-0025', type: 'Payment Voucher', amount: '₹15,000', payee: 'Melam Group', fund: 'Festival Fund', project: 'Annual Festival 2026', by: 'Cashier' },
  { ref: 'RV-2026-0126', type: 'Receipt Voucher', amount: '₹8,500', payee: 'A. Shanmugam', fund: 'General Fund', project: '—', by: 'Cashier' },
  { ref: 'PV-2026-0024', type: 'Payment Voucher', amount: '₹4,200', payee: 'Flower Mart', fund: 'Festival Fund', project: 'Navarathiri 2026', by: 'Cashier' },
];

export const UPCOMING_EVENTS = [
  { name: 'Navarathiri — Day 3', date: '12 October 2026', time: '6:30 PM – 8:00 PM', sponsor: 'M. Ganesan', status: 'Scheduled' as BadgeStatus },
  { name: 'Annual Festival — Day 5', date: '25 November 2026', time: '6:00 AM – 1:00 PM', sponsor: 'Sivashri Family', status: 'Scheduled' as BadgeStatus },
  { name: 'Karthigai Deepam', date: '5 December 2026', time: '5:30 PM – 7:00 PM', sponsor: 'T. Rajendran', status: 'Scheduled' as BadgeStatus },
];

export const RECENT_ACTIVITY = [
  { action: 'Cashier submitted payment voucher', ref: 'PV-2026-0025', user: 'R. Murugan', time: '2m ago' },
  { action: 'Admin approved receipt voucher', ref: 'RV-2026-0124', user: 'K. Suresh', time: '18m ago' },
  { action: 'New sponsor assigned to Navarathiri Day 3', ref: '', user: 'K. Suresh', time: '45m ago' },
  { action: 'User account created', ref: 'USR-007', user: 'K. Suresh', time: '2h ago' },
  { action: 'Financial year 2026 opened', ref: 'FY-2026', user: 'System', time: '3h ago' },
];

export const TXN_DATA = [
  { date: '12 Aug', ref: 'RV-2026-0125', desc: 'Festival Donation', fund: 'Festival Fund', project: 'Navarathiri 2026', debit: '', credit: '25,000', status: 'Posted' as BadgeStatus },
  { date: '12 Aug', ref: 'PV-2026-0074', desc: 'Melam Payment', fund: 'Festival Fund', project: 'Annual Festival 2026', debit: '15,000', credit: '', status: 'Pending Approval' as BadgeStatus },
  { date: '11 Aug', ref: 'RV-2026-0124', desc: 'Temple Entry Donations', fund: 'General Fund', project: '—', debit: '', credit: '12,500', status: 'Posted' as BadgeStatus },
  { date: '11 Aug', ref: 'PV-2026-0073', desc: 'Electricity Bill — July', fund: 'General Fund', project: '—', debit: '8,200', credit: '', status: 'Approved' as BadgeStatus },
  { date: '10 Aug', ref: 'RV-2026-0123', desc: 'FD Interest — Q2', fund: 'Thiruppani Fund', project: '—', debit: '', credit: '12,450', status: 'Posted' as BadgeStatus },
];

export const CASHIER_SUBMISSIONS = [
  { ref: 'RV-2026-0125', type: 'Receipt', amount: '₹25,000', date: '12 Aug', status: 'Pending Approval' as BadgeStatus },
  { ref: 'PV-2026-0074', type: 'Payment', amount: '₹15,000', date: '12 Aug', status: 'Approved' as BadgeStatus },
  { ref: 'PV-2026-0075', type: 'Payment', amount: '₹8,000', date: '12 Aug', status: 'Rejected' as BadgeStatus },
  { ref: 'RV-2026-0124', type: 'Receipt', amount: '₹12,500', date: '11 Aug', status: 'Posted' as BadgeStatus },
];

export const CASHIER_ACTIVITY = [
  { action: 'Receipt submitted', ref: 'RV-2026-0125', time: '2m ago', color: 'var(--success)' },
  { action: 'Payment voucher approved', ref: 'PV-2026-0074', time: '45m ago', color: 'var(--accent)' },
  { action: 'Payment voucher rejected', ref: 'PV-2026-0073', time: '2h ago', color: 'var(--danger)' },
  { action: 'Receipt submitted', ref: 'RV-2026-0124', time: '3h ago', color: 'var(--success)' },
];

export const WORKFLOW_STEPS = [
  { n: 1, label: 'Create Entry', desc: 'Draft a receipt or payment voucher' },
  { n: 2, label: 'Submit', desc: 'Send for approval' },
  { n: 3, label: 'Pending Approval', desc: 'Awaiting authorized approver' },
  { n: 4, label: 'Review & Decision', desc: 'Admin or authorized approver acts' },
  { n: 5, label: 'Approved & Posted', desc: 'Entry affects official accounting records' },
];
