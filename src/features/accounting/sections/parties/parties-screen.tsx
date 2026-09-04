'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, Users, X } from 'lucide-react';

import { useServerAction } from '@/hooks/use-server-action';
import {
  ActionError,
  Card,
  ConfirmDialog,
  DataCell,
  DataRow,
  DataTable,
  DataTableEmpty,
  EmptyState,
  PortalPageHeader,
  ReadOnlyNotice,
  StatCard,
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
import { cn } from '@/lib/utils';

import {
  PartyFormDialog,
  type PartyDraft,
} from '../../components/party-form-dialog';
import { Amount } from '../../components/amount';
import type { AccountingAccess } from '../../lib/accounting-access';
import {
  PARTY_KINDS,
  PARTY_KIND_LABELS,
  formatCurrency,
} from '../../lib/accounting-data';
import {
  createParty,
  deactivateParty,
  updateParty,
} from '../../lib/accounting-actions';
import type { PartyKind, PartyRecord } from '../../types';

interface PartiesScreenProps {
  initialParties: readonly PartyRecord[];
  access: AccountingAccess;
  year: number;
}

export function PartiesScreen({
  initialParties,
  access,
  year,
}: PartiesScreenProps) {
  const parties = initialParties;
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<PartyKind | 'all'>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PartyRecord | null>(null);
  const [retiring, setRetiring] = useState<PartyRecord | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return parties.filter((party) => {
      if (kind !== 'all' && party.kind !== kind) return false;
      if (!needle) return true;

      return `${party.name} ${party.nameEn}`.toLowerCase().includes(needle);
    });
  }, [parties, query, kind]);

  const totals = useMemo(
    () => ({
      contributed: parties.reduce((sum, party) => sum + party.contributed, 0),
      paid: parties.reduce((sum, party) => sum + party.paid, 0),
      onRecord: parties.filter((party) => party.entryCount > 0).length,
    }),
    [parties],
  );

  const { run, error: actionError } = useServerAction();

  function handleSubmit(draft: PartyDraft) {
    const target = editing;

    run(
      () =>
        target
          ? updateParty(target.id, {
              nameTa: draft.nameTa,
              nameEn: draft.nameEn,
              kind: draft.kind,
              phone: draft.phone || null,
              isActive: draft.isActive,
            })
          : createParty({
              nameTa: draft.nameTa,
              nameEn: draft.nameEn,
              kind: draft.kind,
              phone: draft.phone || null,
            }),
      () => {
        setEditing(null);
        setFormOpen(false);
      },
    );
  }

  const columns: DataColumn[] = [
    { key: 'name', label: 'Party' },
    { key: 'kind', label: 'Kind' },
    { key: 'entries', label: 'Entries', align: 'right' },
    { key: 'contributed', label: 'Contributed', align: 'right' },
    { key: 'paid', label: 'Paid Out', align: 'right' },
    ...(access.canManageParties
      ? [{ key: 'actions', label: 'Actions', align: 'right', srOnly: true } as const]
      : []),
  ];

  const isFiltered = query.trim() !== '' || kind !== 'all';

  return (
    <>
      <PortalPageHeader
        title="Parties"
        description="Who entries are with. Sponsors, priests, vendors and devotees sit beneath the chart of accounts rather than in it."
        meta={[
          <span key="year" className="tabular">
            Financial year {year}
          </span>,
          <span key="count" className="tabular">
            {parties.length} on file
          </span>,
        ]}
        actions={
          access.canManageParties && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              New Party
            </Button>
          )
        }
      />

      <ActionError message={actionError} />

      {!access.canManageParties && (
        <ReadOnlyNotice message="You can see the parties. Adding or changing one is restricted to administrators and accountants." />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Contributed"
          value={formatCurrency(totals.contributed)}
          caption="Sponsorships and donations received"
        />
        <StatCard
          label="Paid Out"
          value={formatCurrency(totals.paid)}
          caption="Honoraria, wages and invoices"
        />
        <StatCard
          label="With Entries"
          value={String(totals.onRecord)}
          caption={`of ${parties.length} on file`}
        />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <InputGroup className="sm:max-w-xs">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              placeholder="Search parties"
              onChange={(changeEvent) => setQuery(changeEvent.target.value)}
            />
          </InputGroup>

          <Select
            value={kind}
            onValueChange={(value) => setKind(value as PartyKind | 'all')}
          >
            <SelectTrigger className="sm:w-44">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>

              {PARTY_KINDS.map((entry) => (
                <SelectItem key={entry} value={entry}>
                  {PARTY_KIND_LABELS[entry]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('');
                setKind('all');
              }}
            >
              <X />
              Clear
            </Button>
          )}
        </div>

        <DataTable columns={columns}>
          {parties.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              <EmptyState
                icon={Users}
                title="Nobody on file yet"
                description="A party is whoever an entry is with — a sponsor, the kurukkal, a vendor. Add one and receipts and payments can name them."
              />
            </DataTableEmpty>
          ) : filtered.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              Nothing matches that search.
            </DataTableEmpty>
          ) : (
            filtered.map((party) => (
              <DataRow key={party.id}>
                <DataCell>
                  <p
                    className={cn(
                      'truncate text-[13px]',
                      party.isActive
                        ? 'text-text-primary'
                        : 'text-text-disabled line-through',
                    )}
                  >
                    {party.name}
                  </p>
                  {party.nameEn && (
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {party.nameEn}
                    </p>
                  )}
                </DataCell>

                <DataCell nowrap className="text-xs text-text-secondary">
                  {PARTY_KIND_LABELS[party.kind]}
                </DataCell>

                <DataCell align="right" nowrap className="text-xs tabular">
                  {party.entryCount > 0 ? (
                    party.entryCount
                  ) : (
                    <span className="text-text-disabled">—</span>
                  )}
                </DataCell>

                <DataCell align="right" nowrap>
                  <Amount value={party.contributed} tone="in" />
                </DataCell>

                <DataCell align="right" nowrap>
                  <Amount value={party.paid} tone="out" />
                </DataCell>

                {access.canManageParties && (
                  <DataCell align="right" nowrap>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(party);
                          setFormOpen(true);
                        }}
                      >
                        Edit
                      </Button>

                      {party.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger hover:bg-danger-subtle hover:text-danger"
                          onClick={() => setRetiring(party)}
                        >
                          Retire
                        </Button>
                      )}
                    </div>
                  </DataCell>
                )}
              </DataRow>
            ))
          )}
        </DataTable>
      </Card>

      {access.canManageParties && (
        <PartyFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          party={editing}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={retiring !== null}
        onOpenChange={(open) => !open && setRetiring(null)}
        title="Retire this party?"
        description={
          retiring
            ? `${retiring.name} will no longer be offered on new entries. The ${retiring.entryCount} entries already naming them are unchanged.`
            : ''
        }
        confirmLabel="Retire"
        onConfirm={() => {
          if (retiring) run(() => deactivateParty(retiring.id));
          setRetiring(null);
        }}
      />
    </>
  );
}
