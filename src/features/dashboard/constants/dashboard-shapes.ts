import type { BadgeStatus, PeriodPoint } from '@/components/portal/ui';

/**
 * The shapes each dashboard card renders, and the one constant among them.
 *
 * Every figure now comes from the API through `lib/dashboard-service`; the
 * workflow steps stay here because they describe how a voucher moves, which is
 * a fact about the portal rather than data about the temple.
 */

export type { PeriodPoint };

export interface ApprovalItem {
  readonly ref: string;
  readonly type: 'Payment Voucher' | 'Receipt Voucher';
  readonly amount: number;
  readonly payee: string;
  readonly fund: string;
  readonly project: string;
  readonly createdBy: string;
}

export interface QueueItem {
  readonly ref: string;
  readonly type: 'Receipt' | 'Payment';
  readonly amount: number;
}

export interface Fund {
  readonly name: string;
  readonly income: number;
  readonly expenses: number;
  readonly balance: number;
}

export interface BankAccount {
  readonly name: string;
  readonly balance: number;
}

export interface TempleEvent {
  readonly name: string;
  readonly date: string;
  readonly time: string;
  readonly sponsor: string;
  readonly status: BadgeStatus;
}

export interface ActivityItem {
  readonly id: string;
  readonly action: string;
  readonly ref?: string;
  readonly user: string;
  readonly time: string;
}

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

export interface Submission {
  readonly ref: string;
  readonly type: 'Receipt' | 'Payment';
  readonly amount: number;
  readonly date: string;
  readonly status: BadgeStatus;
}

export interface CashierActivityItem {
  readonly id: string;
  readonly action: string;
  readonly ref: string;
  readonly time: string;
  readonly outcome: 'submitted' | 'approved' | 'rejected';
}

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
