'use client';

import { useMemo, useState } from 'react';
import { Download, Search, X } from 'lucide-react';

import {
  Card,
  DataCell,
  DataRow,
  DataTable,
  DataTableEmpty,
  EmptyState,
  PortalPageHeader,
  StatCard,
  StatusBadge,
  type DataColumn,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Amount } from '../../components/amount';
import { AccountTypeBadge } from '../../components/account-type-badge';
import type { AccountingAccess } from '../../lib/accounting-access';
import {
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  formatCurrency,
  formatMonthLabel,
  formatShortDate,
  monthKey,
} from '../../lib/accounting-data';
import type {
  AccountType,
  FundRef,
  LedgerRecord,
  ProjectRef,
} from '../../types';

interface TransactionsScreenProps {
  entries: readonly LedgerRecord[];
  funds: readonly FundRef[];
  projects: readonly ProjectRef[];
  access: AccountingAccess;
  year: number;
}

interface LedgerFilters {
  query: string;
  fundId: number | 'all';
  projectId: number | 'all';
  accountType: AccountType | 'all';
  month: string | 'all';
}

const EMPTY: LedgerFilters = {
  query: '',
  fundId: 'all',
  projectId: 'all',
  accountType: 'all',
  month: 'all',
};

/**
 * The posted ledger.
 *
 * Only entries that reached `Posted` appear here — that is the difference
 * between this screen and the two registers, and it is the whole reason both
 * exist. A voucher somebody is still arguing about is not a transaction.
 */
export function TransactionsScreen({
  entries,
  funds,
  projects,
  access,
  year,
}: TransactionsScreenProps) {
  const [filters, setFilters] = useState<LedgerFilters>(EMPTY);

  const months = useMemo(
    () => [...new Set(entries.map((entry) => monthKey(entry.date)))].sort().reverse(),
    [entries],
  );

  const filtered = useMemo(() => {
    const needle = filters.query.trim().toLowerCase();

    return entries.filter((entry) => {
      if (filters.fundId !== 'all' && entry.fundId !== filters.fundId) {
        return false;
      }

      if (
        filters.projectId !== 'all' &&
        entry.projectId !== filters.projectId
      ) {
        return false;
      }

      if (
        filters.accountType !== 'all' &&
        entry.account.type !== filters.accountType
      ) {
        return false;
      }

      if (filters.month !== 'all' && monthKey(entry.date) !== filters.month) {
        return false;
      }

      if (!needle) return true;

      return [
        entry.ref,
        entry.description,
        entry.account.name,
        entry.account.code,
        entry.fund.name,
        entry.project?.name ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [entries, filters]);

  const totals = useMemo(
    () => ({
      debit: filtered.reduce((sum, entry) => sum + (entry.debit ?? 0), 0),
      credit: filtered.reduce((sum, entry) => sum + (entry.credit ?? 0), 0),
    }),
    [filtered],
  );

  /**
   * Income and expenditure read off the account class, not the column.
   *
   * The ledger is double entry: every voucher posts a debit and a credit, so
   * summing a column across all entries would count the year twice.
   */
  const yearTotals = useMemo(() => {
    const income = entries
      .filter((entry) => entry.account.type === 'income')
      .reduce((sum, entry) => sum + (entry.credit ?? 0), 0);

    const expenses = entries
      .filter((entry) => entry.account.type === 'expense')
      .reduce((sum, entry) => sum + (entry.debit ?? 0), 0);

    const vouchers = new Set(entries.map((entry) => entry.voucherId)).size;

    const drift = entries.reduce(
      (sum, entry) => sum + (entry.debit ?? 0) - (entry.credit ?? 0),
      0,
    );

    return { income, expenses, vouchers, balanced: Math.abs(drift) < 1 };
  }, [entries]);

  const isFiltered =
    filters.query.trim() !== '' ||
    filters.fundId !== 'all' ||
    filters.projectId !== 'all' ||
    filters.accountType !== 'all' ||
    filters.month !== 'all';

  const columns: DataColumn[] = [
    { key: 'date', label: 'Date' },
    { key: 'ref', label: 'Reference' },
    { key: 'description', label: 'Description' },
    { key: 'account', label: 'Account' },
    { key: 'fund', label: 'Fund / Project' },
    { key: 'debit', label: 'Debit', align: 'right' },
    { key: 'credit', label: 'Credit', align: 'right' },
    { key: 'status', label: 'Status' },
  ];

  function set<K extends keyof LedgerFilters>(key: K, value: LedgerFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <PortalPageHeader
        title="Transactions"
        description="The posted ledger, in double entry. Every voucher appears twice — once against its head, once against the cash or bank it moved through."
        meta={[
          <span key="year" className="tabular">
            Financial year {year}
          </span>,
          <span key="count" className="tabular">
            {yearTotals.vouchers} vouchers · {entries.length} ledger lines
          </span>,
        ]}
        actions={
          access.canExportTransactions && (
            <Button variant="outline">
              <Download />
              Export Ledger
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Income"
          value={formatCurrency(yearTotals.income)}
          caption="Credits to income heads"
        />
        <StatCard
          label="Total Expenditure"
          value={formatCurrency(yearTotals.expenses)}
          caption="Debits to expenditure heads"
        />
        <StatCard
          label="Net Surplus"
          value={formatCurrency(yearTotals.income - yearTotals.expenses)}
          caption="Income less expenditure"
        />
        <StatCard
          label="Ledger Integrity"
          value={yearTotals.balanced ? 'Balanced' : 'Out'}
          caption={`${yearTotals.vouchers} vouchers posted`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-64">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>

          <InputGroupInput
            type="search"
            value={filters.query}
            placeholder="Search reference, description, account…"
            aria-label="Search transactions"
            onChange={(changeEvent) => set('query', changeEvent.target.value)}
          />
        </InputGroup>

        <Select
          value={filters.month}
          onValueChange={(value) => set('month', value)}
        >
          <SelectTrigger aria-label="Filter by month">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All months</SelectItem>

            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {formatMonthLabel(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.fundId === 'all' ? 'all' : String(filters.fundId)}
          onValueChange={(value) =>
            setFilters((current) => ({
              ...current,
              fundId: value === 'all' ? 'all' : Number(value),
              // A project belongs to one fund; keeping it would contradict
              // the fund that was just chosen.
              projectId: 'all',
            }))
          }
        >
          <SelectTrigger aria-label="Filter by fund">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All funds</SelectItem>

            {funds.map((fund) => (
              <SelectItem key={fund.id} value={String(fund.id)}>
                {fund.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.projectId === 'all' ? 'all' : String(filters.projectId)}
          onValueChange={(value) =>
            set('projectId', value === 'all' ? 'all' : Number(value))
          }
        >
          <SelectTrigger aria-label="Filter by project">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>

            {projects
              .filter(
                (project) =>
                  filters.fundId === 'all' || project.fundId === filters.fundId,
              )
              .map((project) => (
                <SelectItem key={project.id} value={String(project.id)}>
                  {project.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.accountType}
          onValueChange={(value) =>
            set('accountType', value as AccountType | 'all')
          }
        >
          <SelectTrigger aria-label="Filter by account type">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All account types</SelectItem>

            {ACCOUNT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {ACCOUNT_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY)}>
            <X />
            Clear
          </Button>
        )}
      </div>

      <Card>
        <DataTable columns={columns} minWidth={1100}>
          {filtered.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              <EmptyState
                icon={Search}
                title="No transactions match these filters"
                description="Adjust the search or filters above to see more of the ledger."
              />
            </DataTableEmpty>
          ) : (
            <>
              {filtered.map((entry) => (
                <DataRow key={entry.id}>
                  <DataCell nowrap className="text-xs text-text-muted tabular">
                    {formatShortDate(entry.date)}
                  </DataCell>

                  <DataCell nowrap className="ref text-xs font-medium text-primary">
                    {entry.ref}
                  </DataCell>

                  <DataCell>
                    <p className="truncate text-[13px] text-text-primary">
                      {entry.description}
                    </p>
                  </DataCell>

                  <DataCell nowrap>
                    <div className="flex items-center gap-2">
                      <AccountTypeBadge type={entry.account.type} />
                      <span className="text-xs text-text-secondary">
                        {entry.account.code} · {entry.account.name}
                      </span>
                    </div>
                  </DataCell>

                  <DataCell>
                    <p className="truncate text-xs text-text-secondary">
                      {entry.fund.name}
                    </p>
                    {entry.project && (
                      <p className="mt-0.5 truncate text-[11px] text-text-muted">
                        {entry.project.name}
                      </p>
                    )}
                  </DataCell>

                  <DataCell align="right" nowrap>
                    <Amount value={entry.debit} tone="out" />
                  </DataCell>

                  <DataCell align="right" nowrap>
                    <Amount value={entry.credit} tone="in" />
                  </DataCell>

                  <DataCell nowrap>
                    <StatusBadge status={entry.status} />
                  </DataCell>
                </DataRow>
              ))}

              <tr className="border-t border-border-strong bg-surface-2">
                <td
                  colSpan={5}
                  className="px-4 py-2.5 text-[11px] font-medium text-text-muted"
                >
                  {isFiltered
                    ? `Totals for ${filtered.length} filtered entries`
                    : `Totals for all ${filtered.length} entries`}
                </td>
                <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-danger tabular">
                  {formatCurrency(totals.debit)}
                </td>
                <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-success tabular">
                  {formatCurrency(totals.credit)}
                </td>
                <td />
              </tr>
            </>
          )}
        </DataTable>
      </Card>
    </>
  );
}
