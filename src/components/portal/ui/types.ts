export type BadgeStatus =
  | 'Draft'
  | 'Submitted'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Posted'
  | 'Cancelled'
  | 'Scheduled'
  | 'Active'
  | 'Completed'
  | 'Unassigned'
  | 'Today';

export interface PeriodPoint {
  readonly label: string;
  readonly income: number;
  readonly expenses: number;
}
