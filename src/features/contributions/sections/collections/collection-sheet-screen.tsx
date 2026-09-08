'use client';

import { useMemo, useState, useTransition } from 'react';
import { HandCoins, Search, X } from 'lucide-react';

import {
  ActionError,
  Card,
  DataCell,
  DataRow,
  DataTable,
  DataTableEmpty,
  EmptyState,
  FormField,
  PortalPageHeader,
  StatCard,
  type DataColumn,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

import { formatCurrency, formatShortDate } from '../../lib/contributions-data';
import { recordCollection } from '../../lib/collection-actions';
import type { CollectionEvent, Contributor, ContributorReason } from '../../types';

const REASON_LABEL: Record<ContributorReason, string> = {
  'gave-before': 'Gave last time',
  sponsor: 'Sponsor',
  vendor: 'Vendor',
  devotee: 'Devotee',
};

interface CollectionSheetScreenProps {
  event: CollectionEvent;
  contributors: readonly Contributor[];
  accountId: number;
  fundId: number;
  activityId: number | null;
  today: string;
}

/**
 * The collection sheet.
 *
 * Opens with everyone who gave the last time this observance came round, and
 * what they gave, because that list is what the collector actually walks with.
 * Each filled row becomes its own numbered receipt — the person is handed one
 * at the counter, so the number has to mean their gift and not the sheet's.
 */
export function CollectionSheetScreen({
  event,
  contributors,
  accountId,
  fundId,
  activityId,
  today,
}: CollectionSheetScreenProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [paidOn, setPaidOn] = useState(today);
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ count: number; total: number } | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) return contributors;

    return contributors.filter((person) =>
      `${person.name} ${person.nameEn} ${person.phone}`.toLowerCase().includes(needle),
    );
  }, [contributors, query]);

  const entered = useMemo(() => {
    const rows = Object.entries(amounts)
      .map(([partyId, raw]) => ({ partyId: Number(partyId), amount: Number(raw) || 0 }))
      .filter((row) => row.amount > 0);

    return {
      count: rows.length,
      total: rows.reduce((sum, row) => sum + row.amount, 0),
      rows,
    };
  }, [amounts]);

  const collectedSoFar = useMemo(
    () => contributors.reduce((sum, person) => sum + (person.paidAmount ?? 0), 0),
    [contributors],
  );

  function setAmount(partyId: number, value: string) {
    setAmounts((current) => ({ ...current, [partyId]: value }));
  }

  /** Offer last year's figure, so the usual case is one tap. */
  function prefillLastYear() {
    const next: Record<number, string> = {};

    for (const person of contributors) {
      if (!person.paidThisTime && person.lastAmount) {
        next[person.partyId] = String(person.lastAmount);
      }
    }

    setAmounts((current) => ({ ...next, ...current }));
  }

  function handleSubmit() {
    const byId = new Map(contributors.map((person) => [person.partyId, person]));

    startTransition(async () => {
      const result = await recordCollection({
        eventId: event.id,
        eventLabel: `${event.eventTypeName} — ${event.instanceLabel}`,
        paidOn,
        accountId,
        fundId,
        activityId,
        lines: entered.rows.map((row) => ({
          partyId: row.partyId,
          name: byId.get(row.partyId)?.name ?? '',
          amount: row.amount,
        })),
      });

      if (result.message) {
        setError(result.message);
        return;
      }

      if (result.failures.length > 0) {
        setError(
          `${result.receipts.length} receipt(s) raised. Could not raise: ${result.failures
            .map((failure) => `${failure.name} (${failure.message})`)
            .join('; ')}`,
        );
      } else {
        setError(null);
      }

      setDone({ count: result.receipts.length, total: entered.total });
      setAmounts({});
      router.refresh();
    });
  }

  const columns: DataColumn[] = [
    { key: 'name', label: 'Contributor' },
    { key: 'reason', label: 'Why listed' },
    { key: 'last', label: 'Last time', align: 'right' },
    { key: 'amount', label: 'Giving now', align: 'right' },
  ];

  return (
    <>
      <PortalPageHeader
        title="Collection sheet"
        description={`${event.eventTypeName} — ${event.instanceLabel}, ${formatShortDate(event.scheduledDate)}. Each amount entered becomes its own numbered receipt.`}
        meta={[
          <span key="count" className="tabular">
            {contributors.length} on the sheet
          </span>,
          <span key="collected" className="tabular">
            {formatCurrency(collectedSoFar)} collected
          </span>,
        ]}
        actions={
          <Button
            onClick={handleSubmit}
            disabled={pending || entered.count === 0}
          >
            {pending
              ? 'Raising receipts…'
              : entered.count === 0
                ? 'Enter amounts'
                : `Raise ${entered.count} receipt${entered.count === 1 ? '' : 's'}`}
          </Button>
        }
      />

      {error && <ActionError message={error} />}

      {done && (
        <div className="rounded-lg border border-border bg-success-subtle px-3.5 py-2.5 text-xs text-success">
          Raised {done.count} receipt{done.count === 1 ? '' : 's'} totalling{' '}
          {formatCurrency(done.total)}.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="On the sheet" value={String(contributors.length)} />
        <StatCard
          label="Gave last time"
          value={String(contributors.filter((person) => person.lastAmount !== null).length)}
        />
        <StatCard label="Entered now" value={String(entered.count)} />
        <StatCard label="Total entered" value={formatCurrency(entered.total)} />
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <InputGroup className="min-w-[220px] flex-1">
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              placeholder="Search a name or phone…"
              onChange={(changeEvent) => setQuery(changeEvent.target.value)}
            />
            {query && (
              <InputGroupAddon align="inline-end">
                <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
                  <X className="size-4" />
                </button>
              </InputGroupAddon>
            )}
          </InputGroup>

          <FormField id="collection-date" label="Collected on" className="w-[170px]">
            <Input
              id="collection-date"
              type="date"
              value={paidOn}
              onChange={(changeEvent) => setPaidOn(changeEvent.target.value)}
            />
          </FormField>

          <Button type="button" variant="ghost" onClick={prefillLastYear}>
            Fill last time’s amounts
          </Button>
        </div>

        <DataTable columns={columns} minWidth={760}>
          {filtered.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              <EmptyState
                icon={HandCoins}
                title="Nobody to show"
                description={
                  query
                    ? 'No contributor matches that search.'
                    : 'Nobody has given to this observance before, and there are no sponsors or vendors on record yet.'
                }
              />
            </DataTableEmpty>
          ) : (
            filtered.map((person) => (
              <DataRow key={person.partyId}>
                <DataCell>
                  <span className="block font-medium text-text-primary">{person.name}</span>
                  {person.phone && (
                    <span className="block text-xs text-text-tertiary tabular">
                      {person.phone}
                    </span>
                  )}
                </DataCell>
                <DataCell>
                  <span
                    className={cn(
                      'text-[11px]',
                      person.reason === 'gave-before'
                        ? 'font-medium text-text-secondary'
                        : 'text-text-tertiary',
                    )}
                  >
                    {REASON_LABEL[person.reason]}
                  </span>
                </DataCell>
                <DataCell align="right" className="tabular text-text-secondary">
                  {person.lastAmount === null ? (
                    '—'
                  ) : (
                    <>
                      {formatCurrency(person.lastAmount)}
                      {person.lastYear && (
                        <span className="ml-1 text-[11px] text-text-tertiary">
                          ({person.lastYear})
                        </span>
                      )}
                    </>
                  )}
                </DataCell>
                <DataCell align="right">
                  {person.paidThisTime ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2 py-0.5 text-[11px] font-medium text-success">
                      <span className="size-1.5 rounded-full bg-current" aria-hidden />
                      {formatCurrency(person.paidAmount ?? 0)}
                    </span>
                  ) : (
                    <Input
                      aria-label={`Amount from ${person.name}`}
                      className="ml-auto w-28 text-right tabular"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amounts[person.partyId] ?? ''}
                      onChange={(changeEvent) =>
                        setAmount(person.partyId, changeEvent.target.value)
                      }
                    />
                  )}
                </DataCell>
              </DataRow>
            ))
          )}
        </DataTable>
      </Card>
    </>
  );
}
