import type { PeriodPoint } from '@/components/portal/ui';
import { getToday } from '@/lib/format';

import {
  ACCOUNTS,
  BANK_ACCOUNTS,
  CASH_ACCOUNT_ID,
  FUNDS,
  PROJECTS,
  VOUCHERS,
} from '../constants/mock-data';
import type {
  Account,
  AccountRecord,
  AccountRef,
  AccountingSummary,
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
  Project,
  ProjectRef,
  StatementLine,
  TrialBalanceRow,
  Voucher,
  VoucherRecord,
} from '../types';

/**
 * TODO: replace the module-level constants with calls to the accounting
 * API.
 */

function indexBy<T, K extends string | number>(
  items: readonly T[],
  key: (item: T) => K,
): Map<K, T> {
  return new Map(items.map((item) => [key(item), item]));
}

const accountsById = indexBy(ACCOUNTS, (account) => account.id);
const fundsById = indexBy(FUNDS, (fund) => fund.id);
const projectsById = indexBy(PROJECTS, (project) => project.id);
const banksById = indexBy(BANK_ACCOUNTS, (bank) => bank.id);

function accountRef(account: Account): AccountRef {
  return {
    id: account.id,
    code: account.code,
    name: account.name,
    nameTa: account.nameTa,
    type: account.type,
  };
}

function fundRef(fund: Fund): FundRef {
  return { id: fund.id, name: fund.name, nameTa: fund.nameTa };
}

function projectRef(project: Project): ProjectRef {
  return {
    id: project.id,
    name: project.name,
    fundId: project.fundId,
    isActive: project.isActive,
  };
}

function bankRef(bank: BankAccount): BankAccountRef {
  return {
    id: bank.id,
    label: bank.label,
    type: bank.type,
    isActive: bank.isActive,
  };
}

export function getAccounts(): readonly Account[] {
  return ACCOUNTS;
}

function debitIncreases(type: AccountRecord['type']): boolean {
  return type === 'asset' || type === 'expense';
}

export function getAccountRecords(): readonly AccountRecord[] {
  const ledger = getLedger();

  const movement = new Map<number, { debit: number; credit: number }>();

  for (const entry of ledger) {
    const current = movement.get(entry.accountId) ?? { debit: 0, credit: 0 };

    movement.set(entry.accountId, {
      debit: current.debit + (entry.debit ?? 0),
      credit: current.credit + (entry.credit ?? 0),
    });
  }

  function balanceOf(account: Account): number {
    const { debit, credit } = movement.get(account.id) ?? {
      debit: 0,
      credit: 0,
    };

    return debitIncreases(account.type)
      ? account.openingBalance + debit - credit
      : account.openingBalance + credit - debit;
  }

  const balances = new Map<number, number>(
    ACCOUNTS.map((account) => [account.id, balanceOf(account)]),
  );

  return ACCOUNTS.map((account) => {
    const children = ACCOUNTS.filter(
      (candidate) => candidate.parentId === account.id,
    );

    return {
      ...account,
      parent: account.parentId
        ? accountsById.get(account.parentId) ?? null
        : null,
      entryCount: ledger.filter((entry) => entry.accountId === account.id)
        .length,
      balance:
        children.length > 0
          ? children.reduce(
              (sum, child) => sum + (balances.get(child.id) ?? 0),
              0,
            )
          : balances.get(account.id) ?? 0,
    };
  });
}

export function getPostableAccounts(): readonly AccountRef[] {
  return ACCOUNTS.filter(
    (account) => account.parentId !== null && account.isActive,
  ).map(accountRef);
}

export function getFundOptions(): readonly FundRef[] {
  return FUNDS.filter((fund) => fund.isActive).map(fundRef);
}

export function getProjectOptions(): readonly ProjectRef[] {
  return PROJECTS.map(projectRef);
}

export function getBankAccountOptions(): readonly BankAccountRef[] {
  return BANK_ACCOUNTS.map(bankRef);
}

export function getFunds(): readonly Fund[] {
  return FUNDS;
}

export function getFundPositions(): readonly FundPosition[] {
  return FUNDS.map((fund) => ({
    ...fund,
    balance: fund.opening + fund.income - fund.expenses,
  }));
}

export function getProjects(): readonly Project[] {
  return PROJECTS;
}

export function getBankAccounts(): readonly BankAccount[] {
  return BANK_ACCOUNTS;
}

function resolve(entry: Voucher): VoucherRecord {
  const account = accountsById.get(entry.accountId);
  const fund = fundsById.get(entry.fundId);

  if (!account || !fund) {
    throw new Error(`Voucher ${entry.ref} references a missing account or fund`);
  }

  const project = entry.projectId
    ? projectsById.get(entry.projectId) ?? null
    : null;

  const bank = entry.bankAccountId
    ? banksById.get(entry.bankAccountId) ?? null
    : null;

  return {
    ...entry,
    account: accountRef(account),
    fund: fundRef(fund),
    project: project ? projectRef(project) : null,
    bankAccount: bank ? bankRef(bank) : null,
  };
}

function byDateDescending(a: VoucherRecord, b: VoucherRecord): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return b.id - a.id;
}

export function getVouchers(): readonly VoucherRecord[] {
  return VOUCHERS.map(resolve).sort(byDateDescending);
}

export function getVouchersOfKind(
  kind: 'receipt' | 'payment',
): readonly VoucherRecord[] {
  return getVouchers().filter((entry) => entry.kind === kind);
}

export function getPendingVouchers(): readonly VoucherRecord[] {
  return getVouchers().filter((entry) => entry.status === 'Pending Approval');
}

function contraAccountId(voucher: Voucher): number {
  if (voucher.mode === 'cash') return CASH_ACCOUNT_ID;

  const bank = voucher.bankAccountId
    ? banksById.get(voucher.bankAccountId)
    : undefined;

  return bank?.ledgerAccountId ?? CASH_ACCOUNT_ID;
}

export function getLedger(): readonly LedgerRecord[] {
  const entries: LedgerRecord[] = [];

  for (const voucher of VOUCHERS) {
    if (voucher.status !== 'Posted') continue;

    const resolved = resolve(voucher);
    const contra = accountsById.get(contraAccountId(voucher));

    if (!contra) continue;

    const shared = {
      voucherId: voucher.id,
      date: voucher.date,
      ref: voucher.ref,
      description: voucher.description,
      fundId: voucher.fundId,
      projectId: voucher.projectId,
      mode: voucher.mode,
      bankAccountId: voucher.bankAccountId,
      status: voucher.status,
      fund: resolved.fund,
      project: resolved.project,
    };

    const isReceipt = voucher.kind === 'receipt';

    // Ids are derived from the voucher so a leg keeps a stable identity
    // across reloads: the money leg is even, the head leg is odd.
    entries.push({
      ...shared,
      id: voucher.id * 2,
      accountId: contra.id,
      account: accountRef(contra),
      debit: isReceipt ? voucher.amount : null,
      credit: isReceipt ? null : voucher.amount,
    });

    entries.push({
      ...shared,
      id: voucher.id * 2 + 1,
      accountId: voucher.accountId,
      account: resolved.account,
      debit: isReceipt ? null : voucher.amount,
      credit: isReceipt ? voucher.amount : null,
    });
  }

  return entries.sort((a, b) =>
    a.date === b.date ? b.id - a.id : a.date < b.date ? 1 : -1,
  );
}

function buildBook(
  entries: readonly LedgerRecord[],
  opening: number,
  chequeFor: (voucherId: number) => string | null,
): { rows: readonly BookRow[]; summary: BookSummary } {
  const chronological = [...entries].sort((a, b) =>
    a.date === b.date ? a.id - b.id : a.date < b.date ? -1 : 1,
  );

  let balance = opening;
  let inflow = 0;
  let outflow = 0;

  const rows: BookRow[] = chronological.map((entry) => {
    const rowInflow = entry.debit ?? 0;
    const rowOutflow = entry.credit ?? 0;

    inflow += rowInflow;
    outflow += rowOutflow;
    balance += rowInflow - rowOutflow;

    return {
      ...entry,
      inflow: rowInflow,
      outflow: rowOutflow,
      balance,
      chequeNo: chequeFor(entry.voucherId),
    };
  });

  return {
    rows: rows.reverse(),
    summary: { opening, inflow, outflow, closing: balance },
  };
}

function chequeNoOf(voucherId: number): string | null {
  return VOUCHERS.find((entry) => entry.id === voucherId)?.chequeNo ?? null;
}

export function getCashBook(): {
  rows: readonly BookRow[];
  summary: BookSummary;
} {
  const cashAccount = accountsById.get(CASH_ACCOUNT_ID);

  return buildBook(
    getLedger().filter((entry) => entry.accountId === CASH_ACCOUNT_ID),
    cashAccount?.openingBalance ?? 0,
    chequeNoOf,
  );
}

export function getBankBook(bankAccountId: number): {
  rows: readonly BookRow[];
  summary: BookSummary;
} {
  const bank = banksById.get(bankAccountId);

  if (!bank) {
    return {
      rows: [],
      summary: { opening: 0, inflow: 0, outflow: 0, closing: 0 },
    };
  }

  return buildBook(
    getLedger().filter((entry) => entry.accountId === bank.ledgerAccountId),
    bank.openingBalance,
    chequeNoOf,
  );
}

export function getBankAccountRecords(): readonly BankAccountRecord[] {
  return BANK_ACCOUNTS.map((bank) => ({
    ...bank,
    balance: getBankBook(bank.id).summary.closing,
  }));
}

function totalOn(
  ledger: readonly LedgerRecord[],
  type: 'income' | 'expense',
): number {
  const side = type === 'income' ? 'credit' : 'debit';

  return ledger
    .filter((entry) => entry.account.type === type)
    .reduce((sum, entry) => sum + (entry[side] ?? 0), 0);
}

export function getSummary(): AccountingSummary {
  const ledger = getLedger();

  const income = totalOn(ledger, 'income');
  const expenses = totalOn(ledger, 'expense');

  const pending = VOUCHERS.filter(
    (entry) => entry.status === 'Pending Approval',
  );

  return {
    income,
    expenses,
    surplus: income - expenses,
    cashBalance: getCashBook().summary.closing,
    bankBalance: getBankAccountRecords()
      .filter((bank) => bank.isActive)
      .reduce((sum, bank) => sum + bank.balance, 0),
    pendingApprovals: pending.length,
    pendingAmount: pending.reduce((sum, entry) => sum + entry.amount, 0),
  };
}

function statementLines(
  ledger: readonly LedgerRecord[],
  type: 'income' | 'expense',
): { lines: readonly StatementLine[]; total: number } {
  const side = type === 'income' ? 'credit' : 'debit';
  const totals = new Map<number, number>();

  for (const entry of ledger) {
    if (entry.account.type !== type) continue;

    const amount = entry[side] ?? 0;
    if (amount === 0) continue;

    totals.set(entry.accountId, (totals.get(entry.accountId) ?? 0) + amount);
  }

  const total = [...totals.values()].reduce((sum, value) => sum + value, 0);

  const lines = [...totals.entries()]
    .map(([accountId, amount]) => ({
      account: accountRef(accountsById.get(accountId)!),
      amount,
      share: total === 0 ? 0 : amount / total,
    }))
    .sort((a, b) => b.amount - a.amount);

  return { lines, total };
}

export function getIncomeStatement(): IncomeStatement {
  const ledger = getLedger();

  const income = statementLines(ledger, 'income');
  const expenses = statementLines(ledger, 'expense');

  return {
    income: income.lines,
    expenses: expenses.lines,
    totalIncome: income.total,
    totalExpenses: expenses.total,
    surplus: income.total - expenses.total,
  };
}

export function getTrialBalance(): readonly TrialBalanceRow[] {
  const ledger = getLedger();
  const rows = new Map<number, { debit: number; credit: number }>();

  for (const entry of ledger) {
    const current = rows.get(entry.accountId) ?? { debit: 0, credit: 0 };

    rows.set(entry.accountId, {
      debit: current.debit + (entry.debit ?? 0),
      credit: current.credit + (entry.credit ?? 0),
    });
  }

  return [...rows.entries()]
    .map(([accountId, totals]) => ({
      account: accountRef(accountsById.get(accountId)!),
      ...totals,
    }))
    .sort((a, b) => a.account.code.localeCompare(b.account.code));
}

export function getActiveFinancialYear(): string {
  return getToday().slice(0, 4);
}

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export function getMonthlySeries(today: string = getToday()): PeriodPoint[] {
  const ledger = getLedger();
  const throughMonth = Number(today.slice(5, 7));

  return Array.from({ length: throughMonth }, (_, index) => {
    const month = String(index + 1).padStart(2, '0');
    const prefix = `${today.slice(0, 4)}-${month}`;
    const entries = ledger.filter((entry) => entry.date.startsWith(prefix));

    return {
      label: MONTH_ABBR[index],
      income: totalOn(entries, 'income'),
      expenses: totalOn(entries, 'expense'),
    };
  });
}

export function getQuarterlySeries(today: string = getToday()): PeriodPoint[] {
  const monthly = getMonthlySeries(today);

  return Array.from({ length: Math.ceil(monthly.length / 3) }, (_, index) => {
    const quarter = monthly.slice(index * 3, index * 3 + 3);

    return {
      label: `Q${index + 1}`,
      income: quarter.reduce((sum, point) => sum + point.income, 0),
      expenses: quarter.reduce((sum, point) => sum + point.expenses, 0),
    };
  });
}
