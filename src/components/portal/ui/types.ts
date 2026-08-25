/**
 * Status vocabulary shared by every portal surface.
 *
 * Lives beside the badge that renders it rather than inside one feature, so
 * a voucher, an event and a financial year all speak the same language and
 * a new status is added in exactly one place.
 */
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

/**
 * One plotted period — a month, a quarter, a year.
 *
 * Amounts stay numeric here and are formatted at the axis, so the same
 * series can be drawn compactly on an axis and in full in a tooltip.
 */
export interface PeriodPoint {
  readonly label: string;
  readonly income: number;
  readonly expenses: number;
}
