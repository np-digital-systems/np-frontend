import type { PeriodPoint } from '@/components/portal/ui';

import type { BadgeStatus } from '../types';

export type { PeriodPoint };

export const MONTHLY_DATA: readonly PeriodPoint[] = [
  { label: 'Mar', income: 285000, expenses: 142000 },
  { label: 'Apr', income: 310000, expenses: 198000 },
  { label: 'May', income: 245000, expenses: 156000 },
  { label: 'Jun', income: 520000, expenses: 312000 },
  { label: 'Jul', income: 380000, expenses: 224000 },
  { label: 'Aug', income: 190000, expenses: 89000 },
];

export const QUARTERLY_DATA: readonly PeriodPoint[] = [
  { label: 'Q1', income: 820000, expenses: 465000 },
  { label: 'Q2', income: 1075000, expenses: 666000 },
  { label: 'Q3', income: 570000, expenses: 313000 },
];

export const YEARLY_DATA: readonly PeriodPoint[] = [
  { label: '2023', income: 2100000, expenses: 1380000 },
  { label: '2024', income: 2650000, expenses: 1720000 },
  { label: '2025', income: 3100000, expenses: 1980000 },
  { label: '2026', income: 2465000, expenses: 1444000 },
];

export const THIS_MONTH_DATA: readonly PeriodPoint[] = [
  { label: '01', income: 18000, expenses: 8500 },
  { label: '03', income: 5000, expenses: 0 },
  { label: '05', income: 22000, expenses: 12000 },
  { label: '07', income: 8500, expenses: 4200 },
  { label: '09', income: 35000, expenses: 15000 },
  { label: '11', income: 12500, expenses: 8200 },
  { label: '12', income: 25000, expenses: 18500 },
];

export const LAST_MONTH_DATA: readonly PeriodPoint[] = [
  { label: '01', income: 15000, expenses: 6000 },
  { label: '05', income: 28000, expenses: 18000 },
  { label: '10', income: 12000, expenses: 5200 },
  { label: '15', income: 42000, expenses: 21000 },
  { label: '20', income: 18500, expenses: 9800 },
  { label: '25', income: 31000, expenses: 14200 },
  { label: '31', income: 22000, expenses: 11500 },
];

export interface ApprovalItem {
  readonly ref: string;
  readonly type: 'Payment Voucher' | 'Receipt Voucher';
  readonly amount: number;
  readonly payee: string;
  readonly fund: string;
  readonly project: string;
  readonly createdBy: string;
}

export const PENDING_APPROVALS: readonly ApprovalItem[] = [
  {
    ref: 'PV-2026-0025',
    type: 'Payment Voucher',
    amount: 15000,
    payee: 'Melam Group',
    fund: 'Pooja Fund',
    project: 'Annual Festival 2026',
    createdBy: 'Cashier',
  },
  {
    ref: 'RV-2026-0126',
    type: 'Receipt Voucher',
    amount: 8500,
    payee: 'A. Shanmugam',
    fund: 'General Fund',
    project: '—',
    createdBy: 'Cashier',
  },
  {
    ref: 'PV-2026-0024',
    type: 'Payment Voucher',
    amount: 4200,
    payee: 'Flower Mart',
    fund: 'Pooja Fund',
    project: 'Navarathiri 2026',
    createdBy: 'Cashier',
  },
];

export const TOTAL_PENDING_APPROVALS = 12;

export const APPROVAL_QUEUE = {
  receipts: 5,
  payments: 3,
} as const;

export interface QueueItem {
  readonly ref: string;
  readonly type: 'Receipt' | 'Payment';
  readonly amount: number;
}

export const APPROVAL_QUEUE_ITEMS: readonly QueueItem[] = [
  { ref: 'RV-2026-0125', type: 'Receipt', amount: 25000 },
  { ref: 'PV-2026-0025', type: 'Payment', amount: 15000 },
  { ref: 'RV-2026-0126', type: 'Receipt', amount: 8500 },
];

export interface Fund {
  readonly name: string;
  readonly income: number;
  readonly expenses: number;
  readonly balance: number;
}

export const FUNDS: readonly Fund[] = [
  { name: 'General Temple Fund', income: 820000, expenses: 465000, balance: 355000 },
  { name: 'Pooja Fund', income: 1075000, expenses: 666000, balance: 409000 },
  { name: 'Thiruppani Fund', income: 570000, expenses: 313000, balance: 257000 },
];

export const CASH_POSITION = {
  opening: 120000,
  receipts: 35000,
  payments: 29550,
  closing: 125450,
} as const;

export interface BankAccount {
  readonly name: string;
  readonly balance: number;
}

export const BANK_ACCOUNTS: readonly BankAccount[] = [
  { name: "People's Bank", balance: 450000 },
  { name: 'Bank of Ceylon', balance: 120000 },
];

export const TOTAL_BANK_BALANCE = 570000;

export interface TempleEvent {
  readonly name: string;
  readonly date: string;
  readonly time: string;
  readonly sponsor: string;
  readonly status: BadgeStatus;
}

export const UPCOMING_EVENTS: readonly TempleEvent[] = [
  {
    name: 'Navarathiri — Day 3',
    date: '12 October 2026',
    time: '6:30 PM – 8:00 PM',
    sponsor: 'M. Ganesan',
    status: 'Scheduled',
  },
  {
    name: 'Annual Festival — Day 5',
    date: '25 November 2026',
    time: '6:00 AM – 1:00 PM',
    sponsor: 'Sivashri Family',
    status: 'Scheduled',
  },
  {
    name: 'Karthigai Deepam',
    date: '5 December 2026',
    time: '5:30 PM – 7:00 PM',
    sponsor: 'T. Rajendran',
    status: 'Scheduled',
  },
];

export interface ActivityItem {
  readonly id: string;
  readonly action: string;
  readonly ref?: string;
  readonly user: string;
  readonly time: string;
}

export const RECENT_ACTIVITY: readonly ActivityItem[] = [
  { id: 'a1', action: 'Cashier submitted payment voucher', ref: 'PV-2026-0025', user: 'R. Murugan', time: '2m ago' },
  { id: 'a2', action: 'Admin approved receipt voucher', ref: 'RV-2026-0124', user: 'K. Suresh', time: '18m ago' },
  { id: 'a3', action: 'New sponsor assigned to Navarathiri Day 3', user: 'K. Suresh', time: '45m ago' },
  { id: 'a4', action: 'User account created', ref: 'USR-007', user: 'K. Suresh', time: '2h ago' },
  { id: 'a5', action: 'Financial year 2026 opened', ref: 'FY-2026', user: 'System', time: '3h ago' },
];

export interface Transaction {
  readonly date: string;
  readonly ref: string;
  readonly description: string;
  readonly fund: string;
  readonly project: string;
  readonly debit: number | null;
  readonly credit: number | null;
  readonly status: BadgeStatus;
}

export const TRANSACTIONS: readonly Transaction[] = [
  {
    date: '12 Aug',
    ref: 'RV-2026-0125',
    description: 'Festival Donation',
    fund: 'Pooja Fund',
    project: 'Navarathiri 2026',
    debit: null,
    credit: 25000,
    status: 'Posted',
  },
  {
    date: '12 Aug',
    ref: 'PV-2026-0074',
    description: 'Melam Payment',
    fund: 'Pooja Fund',
    project: 'Annual Festival 2026',
    debit: 15000,
    credit: null,
    status: 'Pending Approval',
  },
  {
    date: '11 Aug',
    ref: 'RV-2026-0124',
    description: 'Temple Entry Donations',
    fund: 'General Fund',
    project: '—',
    debit: null,
    credit: 12500,
    status: 'Posted',
  },
  {
    date: '11 Aug',
    ref: 'PV-2026-0073',
    description: 'Electricity Bill — July',
    fund: 'General Fund',
    project: '—',
    debit: 8200,
    credit: null,
    status: 'Approved',
  },
  {
    date: '10 Aug',
    ref: 'RV-2026-0123',
    description: 'FD Interest — Q2',
    fund: 'Thiruppani Fund',
    project: '—',
    debit: null,
    credit: 12450,
    status: 'Posted',
  },
];

export interface Submission {
  readonly ref: string;
  readonly type: 'Receipt' | 'Payment';
  readonly amount: number;
  readonly date: string;
  readonly status: BadgeStatus;
}

export const CASHIER_SUBMISSIONS: readonly Submission[] = [
  { ref: 'RV-2026-0125', type: 'Receipt', amount: 25000, date: '12 Aug', status: 'Pending Approval' },
  { ref: 'PV-2026-0074', type: 'Payment', amount: 15000, date: '12 Aug', status: 'Approved' },
  { ref: 'PV-2026-0075', type: 'Payment', amount: 8000, date: '12 Aug', status: 'Rejected' },
  { ref: 'RV-2026-0124', type: 'Receipt', amount: 12500, date: '11 Aug', status: 'Posted' },
];

export interface CashierActivityItem {
  readonly id: string;
  readonly action: string;
  readonly ref: string;
  readonly time: string;
  readonly outcome: 'submitted' | 'approved' | 'rejected';
}

export const CASHIER_ACTIVITY: readonly CashierActivityItem[] = [
  { id: 'c1', action: 'Receipt submitted', ref: 'RV-2026-0125', time: '2m ago', outcome: 'submitted' },
  { id: 'c2', action: 'Payment voucher approved', ref: 'PV-2026-0074', time: '45m ago', outcome: 'approved' },
  { id: 'c3', action: 'Payment voucher rejected', ref: 'PV-2026-0073', time: '2h ago', outcome: 'rejected' },
  { id: 'c4', action: 'Receipt submitted', ref: 'RV-2026-0124', time: '3h ago', outcome: 'submitted' },
];

export interface WorkflowStep {
  readonly step: number;
  readonly label: string;
  readonly description: string;
    readonly state: 'done' | 'current' | 'upcoming';
}

export const WORKFLOW_STEPS: readonly WorkflowStep[] = [
  { step: 1, label: 'Create Entry', description: 'Draft a receipt or payment voucher', state: 'done' },
  { step: 2, label: 'Submit', description: 'Send for approval', state: 'done' },
  { step: 3, label: 'Pending Approval', description: 'Awaiting authorized approver', state: 'current' },
  { step: 4, label: 'Review & Decision', description: 'Admin or authorized approver acts', state: 'upcoming' },
  { step: 5, label: 'Approved & Posted', description: 'Entry affects official accounting records', state: 'upcoming' },
];
