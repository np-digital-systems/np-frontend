import 'server-only';

import { api, getAll, type Page } from '@/lib/api';
import {
  getActiveFinancialYearId,
  getFinancialYearContext,
} from '@/lib/financial-year';

import { getTranslations } from 'next-intl/server';

import { getEventTypes, getEvents } from '@/features/events/lib/event-service';
import { instanceLabel } from '@/features/events/lib/public-event-presentation';

import type {
  Account,
  AccountRecord,
  AccountRef,
  AccountingSummary,
  ActivityRecord,
  ActivityRef,
  PartyRecord,
  PartyRef,
  BankAccount,
  BankAccountRecord,
  BankAccountRef,
  BookRow,
  BookSummary,
  Fund,
  FundPosition,
  FundRef,
  IncomeStatement,
  LedgerRecord,
  PoojaRef,
  PoojaTypeRef,
  Project,
  ProjectRef,
  TrialBalanceRow,
  VoucherKind,
  VoucherRecord,
} from '../types';

import type { PeriodPoint } from '@/components/portal/ui';

import { getToday } from './accounting-data';

/**
 * The accounting domain, read from the API.
 *
 * Every balance here is derived server-side from the posted ledger, so nothing
 * in this file recomputes a figure — it would only be a second opinion about
 * money, and two opinions is one too many.
 *
 * Every read that carries a balance is scoped to the year chosen in the
 * header. The picker lists of active funds, projects and heads are not: they
 * feed form dropdowns, where what matters is whether a thing may still be
 * posted to, not what it was worth in some year.
 */

/* -------------------------------------------------------------------------
   Chart of accounts
   ------------------------------------------------------------------------- */

export async function getAccountRecords(): Promise<readonly AccountRecord[]> {
  return api.get<readonly AccountRecord[]>('/accounts', {
    query: { financialYearId: await getActiveFinancialYearId() },
  });
}

export async function getAccounts(): Promise<readonly Account[]> {
  return getAccountRecords();
}

export async function getPostableAccounts(): Promise<readonly AccountRef[]> {
  const accounts = await api.get<readonly AccountRecord[]>('/accounts', {
    query: { postableOnly: true, isActive: true },
  });

  return accounts.map(({ id, code, name, nameTa, type }) => ({
    id,
    code,
    name,
    nameTa,
    type,
  }));
}

/* -------------------------------------------------------------------------
   Activities and parties — the two analytical dimensions
   ------------------------------------------------------------------------- */

export async function getActivityRecords(
  financialYearId?: number,
): Promise<readonly ActivityRecord[]> {
  return api.get<readonly ActivityRecord[]>('/activities', {
    query: { financialYearId: financialYearId ?? (await getActiveFinancialYearId()) },
  });
}

export async function getActivityOptions(): Promise<readonly ActivityRef[]> {
  const activities = await api.get<readonly ActivityRecord[]>('/activities', {
    query: { isActive: true },
  });

  return activities.map(
    ({ id, name, nameEn, kind, defaultFundId, defaultProjectId, defaultPartyId }) => ({
      id,
      name,
      nameEn,
      kind,
      defaultFundId,
      defaultProjectId,
      defaultPartyId,
    }),
  );
}

export async function getPartyRecords(financialYearId?: number): Promise<readonly PartyRecord[]> {
  return api.get<readonly PartyRecord[]>('/parties', {
    query: { financialYearId: financialYearId ?? (await getActiveFinancialYearId()) },
  });
}

export async function getPartyOptions(): Promise<readonly PartyRef[]> {
  const parties = await api.get<readonly PartyRecord[]>('/parties', {
    query: { isActive: true },
  });

  return parties.map(({ id, name, nameEn, roles, userId }) => ({
    id,
    name,
    nameEn,
    roles,
    userId,
  }));
}

/* -------------------------------------------------------------------------
   Funds, projects, banks
   ------------------------------------------------------------------------- */

export async function getFundPositions(): Promise<readonly FundPosition[]> {
  return api.get<readonly FundPosition[]>('/funds', {
    query: { financialYearId: await getActiveFinancialYearId() },
  });
}

export async function getFunds(): Promise<readonly Fund[]> {
  return getFundPositions();
}

export async function getFundOptions(): Promise<readonly FundRef[]> {
  const funds = await api.get<readonly FundPosition[]>('/funds', { query: { isActive: true } });

  return funds.map(({ id, name, nameTa }) => ({ id, name, nameTa }));
}

export async function getProjects(): Promise<readonly Project[]> {
  return api.get<readonly Project[]>('/projects', {
    query: { financialYearId: await getActiveFinancialYearId() },
  });
}

export async function getProjectOptions(): Promise<readonly ProjectRef[]> {
  const projects = await api.get<readonly Project[]>('/projects', { query: { isActive: true } });

  return projects.map(({ id, name, fundId, isActive }) => ({ id, name, fundId, isActive }));
}

export async function getBankAccountRecords(): Promise<readonly BankAccountRecord[]> {
  return api.get<readonly BankAccountRecord[]>('/bank-accounts', {
    query: { financialYearId: await getActiveFinancialYearId() },
  });
}

export async function getBankAccounts(): Promise<readonly BankAccount[]> {
  return getBankAccountRecords();
}

export async function getBankAccountOptions(): Promise<readonly BankAccountRef[]> {
  const accounts = await api.get<readonly BankAccountRecord[]>('/bank-accounts', {
    query: { isActive: true },
  });

  return accounts.map(({ id, label, type, isActive }) => ({ id, label, type, isActive }));
}

/* -------------------------------------------------------------------------
   Vouchers
   ------------------------------------------------------------------------- */

export async function getVouchers(): Promise<readonly VoucherRecord[]> {
  return getAll<VoucherRecord>('/vouchers', {
    financialYearId: await getActiveFinancialYearId(),
  });
}

export async function getVouchersOfKind(kind: VoucherKind): Promise<readonly VoucherRecord[]> {
  return getAll<VoucherRecord>('/vouchers', {
    kind,
    financialYearId: await getActiveFinancialYearId(),
  });
}

export async function getPendingVouchers(): Promise<readonly VoucherRecord[]> {
  return getAll<VoucherRecord>('/vouchers', {
    status: 'Pending Approval',
    order: 'asc',
    financialYearId: await getActiveFinancialYearId(),
  });
}

/* -------------------------------------------------------------------------
   Ledger and the books
   ------------------------------------------------------------------------- */

export async function getLedger(): Promise<readonly LedgerRecord[]> {
  const page = await api.get<Page<LedgerRecord>>('/ledger', {
    query: { limit: 100, financialYearId: await getActiveFinancialYearId() },
  });

  return page.data;
}

interface Book {
  readonly rows: readonly BookRow[];
  readonly summary: BookSummary;
}

export async function getCashBook(): Promise<Book> {
  return api.get<Book>('/cash-book', {
    query: { financialYearId: await getActiveFinancialYearId() },
  });
}

export async function getBankBook(bankAccountId: number): Promise<Book> {
  return api.get<Book>('/bank-book', {
    query: { bankAccountId, financialYearId: await getActiveFinancialYearId() },
  });
}

/* -------------------------------------------------------------------------
   Reports
   ------------------------------------------------------------------------- */

export async function getSummary(): Promise<AccountingSummary> {
  return api.get<AccountingSummary>('/reports/accounting-summary', {
    query: { financialYearId: await getActiveFinancialYearId() },
  });
}

export async function getIncomeStatement(): Promise<IncomeStatement> {
  return api.get<IncomeStatement>('/reports/income-statement', {
    query: { financialYearId: await getActiveFinancialYearId() },
  });
}

export async function getTrialBalance(): Promise<readonly TrialBalanceRow[]> {
  const report = await api.get<{ rows: readonly TrialBalanceRow[] }>(
    '/reports/trial-balance',
    { query: { financialYearId: await getActiveFinancialYearId() } },
  );

  return report.rows;
}

/**
 * The label of the year these figures are for.
 *
 * Reads the year chosen in the header rather than asking the API which year is
 * current: a report captioned "2025/26" while the header says 2024/25 is worse
 * than no caption at all. Falls back to a dash when the books hold no years.
 */
export async function getActiveFinancialYear(): Promise<string> {
  const { active } = await getFinancialYearContext();

  return active?.label ?? '—';
}

/**
 * Income and expenditure by month, read off the posted ledger.
 *
 * Grouping happens here rather than in the API because it is a presentation
 * choice about the chart, not a figure the books have an opinion about.
 */
export async function getMonthlySeries(today: string = getToday()): Promise<PeriodPoint[]> {
  const ledger = await getLedger();
  const accounts = new Map((await getAccounts()).map((account) => [account.id, account.type]));

  const months = new Map<string, { label: string; income: number; expenses: number }>();

  for (const entry of ledger) {
    if (entry.date > today) continue;

    const key = entry.date.slice(0, 7);
    const point = months.get(key) ?? { label: key, income: 0, expenses: 0 };
    const type = accounts.get(entry.accountId);

    if (type === 'income') point.income += (entry.credit ?? 0) - (entry.debit ?? 0);
    if (type === 'expense') point.expenses += (entry.debit ?? 0) - (entry.credit ?? 0);

    months.set(key, point);
  }

  return [...months.values()].sort((a, b) => (a.label < b.label ? -1 : 1));
}

export async function getQuarterlySeries(today: string = getToday()): Promise<PeriodPoint[]> {
  const months = await getMonthlySeries(today);
  const quarters: PeriodPoint[] = [];

  for (let index = 0; index < months.length; index += 3) {
    const quarter = months.slice(index, index + 3);

    quarters.push({
      label: `Q${quarters.length + 1}`,
      income: quarter.reduce((sum, point) => sum + point.income, 0),
      expenses: quarter.reduce((sum, point) => sum + point.expenses, 0),
    });
  }

  return quarters;
}

/* -------------------------------------------------------------------------
   Pooja options for the voucher form, mapped from the events calendar
   ------------------------------------------------------------------------- */

export async function getPoojaTypes(): Promise<readonly PoojaTypeRef[]> {
  const types = await getEventTypes();

  return types.map((type) => ({
    id: type.id,
    name: type.name,
    nameEn: type.nameEn,
    activityId: type.activityId,
  }));
}

export async function getPoojas(): Promise<readonly PoojaRef[]> {
  /*
   * The API renders the slot in English ("Week 1") for its own callers. The
   * voucher form is read in Tamil, so the label is rebuilt here from the raw
   * frequency and number — the same parts, and the same helper, the public
   * calendar uses to say "1ஆம் வாரம்".
   */
  const [events, translate] = await Promise.all([
    getEvents(),
    getTranslations('Events.instance'),
  ]);

  return events.map((event) => ({
    id: event.id,
    eventTypeId: event.eventTypeId,
    activityId: event.eventType.activityId,
    label:
      instanceLabel(
        {
          frequencyType: event.eventType.frequencyType,
          instanceIdentifier: event.instanceIdentifier,
          customInstanceName: event.customInstanceName,
        },
        translate,
      ) ?? event.instanceLabel,
    date: event.scheduledDate,
    sponsorName: event.sponsor?.name ?? null,
    sponsorPartyId: event.sponsorPartyId,
  }));
}
