import { codingSummary } from '@/features/accounting/lib/accounting-data';
import 'server-only';

import type { BadgeStatus } from '@/components/portal/ui';
import {
  getBankAccountRecords,
  getFundPositions,
  getLedger,
  getMonthlySeries,
  getPendingVouchers,
  getQuarterlySeries,
  getSummary,
  getVouchers,
  getCashBook,
} from '@/features/accounting/lib/accounting-service';
import { getAuditEntries } from '@/features/administration/lib/administration-service';
import { getEvents } from '@/features/events/lib/event-service';

import type {
  ActivityItem,
  CashierActivityItem,
  ApprovalItem,
  BankAccount,
  Fund,
  PeriodPoint,
  QueueItem,
  Submission,
  TempleEvent,
  Transaction,
} from '../constants/dashboard-shapes';

/**
 * Everything the role dashboards show, read from the API.
 *
 * Each dashboard is a server component, so the pieces are fetched where they
 * are rendered rather than threaded down as props — and every figure is the
 * same one the screen it links to would show.
 */

const currency = (value: number) => value;

export async function getCashPosition(): Promise<{
  opening: number;
  receipts: number;
  payments: number;
  closing: number;
}> {
  try {
    const book = await getCashBook();

    return {
      opening: book.summary.opening,
      receipts: book.summary.inflow,
      payments: book.summary.outflow,
      closing: book.summary.closing,
    };
  } catch {
    // No cash head configured yet — the books have not been opened.
    return { opening: 0, receipts: 0, payments: 0, closing: 0 };
  }
}

export async function getBankPositions(): Promise<{
  accounts: readonly BankAccount[];
  total: number;
}> {
  const banks = await getBankAccountRecords();
  const active = banks.filter((bank) => bank.isActive);

  return {
    accounts: active.map((bank) => ({ name: bank.label, balance: bank.balance })),
    total: active.reduce((sum, bank) => sum + bank.balance, 0),
  };
}

export async function getFundOverview(): Promise<readonly Fund[]> {
  const funds = await getFundPositions();

  return funds
    .filter((fund) => fund.isActive)
    .map((fund) => ({
      name: fund.name,
      income: fund.income,
      expenses: fund.expenses,
      balance: fund.balance,
    }));
}

export interface ApprovalSummary {
  readonly items: readonly ApprovalItem[];
  readonly queue: readonly QueueItem[];
  readonly total: number;
  readonly amount: number;
  readonly oldestDays: number;
}

export async function getApprovalSummary(): Promise<ApprovalSummary> {
  const [pending, summary] = await Promise.all([getPendingVouchers(), getSummary()]);

  const oldest = pending.reduce<number>((days, voucher) => {
    if (!voucher.submittedAt) return days;

    const age = Math.floor(
      (Date.now() - new Date(voucher.submittedAt).getTime()) / 86_400_000,
    );

    return Math.max(days, age);
  }, 0);

  return {
    items: pending.slice(0, 5).map((voucher) => ({
      ref: voucher.ref,
      type: voucher.kind === 'receipt' ? 'Receipt Voucher' : 'Payment Voucher',
      amount: currency(voucher.amount),
      payee: voucher.party,
      fund: codingSummary(voucher).fund,
      project: voucher.lines[0]?.project?.name ?? '—',
      createdBy: voucher.createdBy.name,
    })),
    queue: pending.slice(0, 3).map((voucher) => ({
      ref: voucher.ref,
      type: voucher.kind === 'receipt' ? 'Receipt' : 'Payment',
      amount: currency(voucher.amount),
    })),
    total: summary.pendingApprovals,
    amount: summary.pendingAmount,
    oldestDays: oldest,
  };
}

export async function getUpcomingEvents(limit = 3): Promise<readonly TempleEvent[]> {
  const events = await getEvents();
  const today = new Date().toISOString().slice(0, 10);

  return events
    .filter((event) => !event.isCompleted && event.scheduledDate >= today)
    .slice(0, limit)
    .map((event) => ({
      name: `${event.eventType.name} — ${event.instanceLabel}`,
      date: new Date(event.scheduledDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      time: event.endTime ? `${event.startTime} – ${event.endTime}` : event.startTime,
      sponsor: event.sponsor?.name ?? 'Unsponsored',
      status: event.status as BadgeStatus,
    }));
}

function relativeTime(at: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(at).getTime()) / 60_000));

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;

  return `${Math.round(minutes / 1440)}d ago`;
}

/** The audit trail, phrased for a dashboard rather than an auditor. */
export async function getRecentActivity(limit = 5): Promise<readonly ActivityItem[]> {
  try {
    const entries = await getAuditEntries(limit);

    return entries.slice(0, limit).map((entry) => ({
      id: String(entry.id),
      action: entry.summary,
      ref: entry.entityRef ?? undefined,
      user: entry.actorName,
      time: relativeTime(entry.at),
    }));
  } catch {
    // Reading the trail needs audit:view; a cashier's dashboard does without.
    return [];
  }
}

export async function getRecentTransactions(limit = 5): Promise<readonly Transaction[]> {
  const ledger = await getLedger();

  return ledger.slice(0, limit).map((entry) => ({
    date: new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    ref: entry.ref,
    description: entry.description,
    fund: entry.fund.name,
    project: entry.project?.name ?? '—',
    debit: entry.debit,
    credit: entry.credit,
    status: entry.status as BadgeStatus,
  }));
}

/** The signed-in cashier's own vouchers — the API scopes this to them. */
export async function getMySubmissions(limit = 4): Promise<readonly Submission[]> {
  const vouchers = await getVouchers();

  return vouchers.slice(0, limit).map((voucher) => ({
    ref: voucher.ref,
    type: voucher.kind === 'receipt' ? 'Receipt' : 'Payment',
    amount: currency(voucher.amount),
    date: new Date(voucher.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    status: voucher.status as BadgeStatus,
  }));
}

/** Split of what is waiting, for the accountant's queue card. */
export async function getQueueSplit(): Promise<{ receipts: number; payments: number }> {
  const pending = await getPendingVouchers();

  return {
    receipts: pending.filter((voucher) => voucher.kind === 'receipt').length,
    payments: pending.filter((voucher) => voucher.kind === 'payment').length,
  };
}

/**
 * What has happened to the signed-in cashier's own entries.
 *
 * Read from their vouchers rather than the audit trail, which a cashier
 * cannot see.
 */
export async function getMyActivity(limit = 4): Promise<readonly CashierActivityItem[]> {
  const vouchers = await getVouchers();
  const kind = (voucher: { kind: string }) =>
    voucher.kind === 'receipt' ? 'Receipt' : 'Payment voucher';

  return vouchers
    .filter((voucher) => voucher.submittedAt !== null)
    .slice(0, limit)
    .map((voucher) => {
      const outcome =
        voucher.status === 'Rejected'
          ? 'rejected'
          : voucher.status === 'Approved' || voucher.status === 'Posted'
            ? 'approved'
            : 'submitted';

      const at = voucher.decidedAt ?? voucher.submittedAt ?? voucher.createdAt;

      return {
        id: String(voucher.id),
        action: `${kind(voucher)} ${outcome}`,
        ref: voucher.ref,
        time: relativeTime(String(at)),
        outcome,
      } as CashierActivityItem;
    });
}

/** The signed-in cashier's own register, counted by where each entry sits. */
export async function getMyVoucherCounts(): Promise<{
  receipts: number;
  payments: number;
  pending: number;
  settled: number;
}> {
  const vouchers = await getVouchers();
  const posted = (status: string) => status === 'Approved' || status === 'Posted';

  return {
    receipts: vouchers
      .filter((voucher) => voucher.kind === 'receipt' && voucher.status !== 'Cancelled')
      .reduce((sum, voucher) => sum + voucher.amount, 0),
    payments: vouchers
      .filter((voucher) => voucher.kind === 'payment' && voucher.status !== 'Cancelled')
      .reduce((sum, voucher) => sum + voucher.amount, 0),
    pending: vouchers.filter((voucher) => voucher.status === 'Pending Approval').length,
    settled: vouchers.filter((voucher) => posted(voucher.status)).length,
  };
}

export interface DashboardSeries {
  readonly monthly: readonly PeriodPoint[];
  readonly quarterly: readonly PeriodPoint[];
  readonly yearly: readonly PeriodPoint[];
}

export async function getSeries(): Promise<DashboardSeries> {
  const [monthly, quarterly] = await Promise.all([getMonthlySeries(), getQuarterlySeries()]);

  const yearly = [
    {
      label: String(new Date().getFullYear()),
      income: monthly.reduce((sum, point) => sum + point.income, 0),
      expenses: monthly.reduce((sum, point) => sum + point.expenses, 0),
    },
  ];

  return { monthly, quarterly, yearly };
}

export { getSummary as getAccountingSummary };
