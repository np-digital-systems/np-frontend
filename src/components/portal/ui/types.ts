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
  | 'Today'
  // A pooja costing: the version being quoted from, and the ones it replaced.
  | 'In force'
  | 'Superseded'
  // A budget line, measured against the vouchers raised for it.
  | 'Not raised'
  | 'In progress';

export interface PeriodPoint {
  readonly label: string;
  readonly income: number;
  readonly expenses: number;
}
