'use client';

import { useMemo, useState } from 'react';
import { Coins, Plus, Search } from 'lucide-react';

import {
  ActionError,
  Card,
  CardHeader,
  ConfirmDialog,
  DataCell,
  DataRow,
  DataTable,
  DataTableEmpty,
  EmptyState,
  PortalPageHeader,
  StatusBadge,
  type DataColumn,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { useServerAction } from '@/hooks/use-server-action';
import { Link } from '@/i18n/routing';
import { formatCurrency } from '@/lib/format';

import {
  CostingFormDialog,
  type CostingHeaderDraft,
} from '../../components/costing-form-dialog';
import { CopyCostingDialog } from '../../components/copy-costing-dialog';
import { copyCosting, createCosting, deleteCosting } from '../../lib/costing-actions';
import {
  costingBadge,
  describePeriod,
  describeScope,
  describeScopeReach,
} from '../../lib/costing-data';
import { costingRoute } from '../../lib/routes';
import type { CostingRecord } from '../../types/costing';
import type { EventTypeRecord } from '../../types';

const COLUMNS: DataColumn[] = [
  { key: 'scope', label: 'Pooja' },
  { key: 'period', label: 'Applies' },
  { key: 'status', label: 'Status' },
  { key: 'quote', label: 'Quoted', align: 'right' },
  { key: 'cost', label: 'Expected cost', align: 'right' },
  { key: 'used', label: 'Costed', align: 'right' },
  { key: 'actions', label: 'Actions', align: 'right', srOnly: true },
];

interface CostingsScreenProps {
  costings: readonly CostingRecord[];
  eventTypes: readonly EventTypeRecord[];
  canManage: boolean;
}

export function CostingsScreen({
  costings,
  eventTypes,
  canManage,
}: CostingsScreenProps) {
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [copying, setCopying] = useState<CostingRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CostingRecord | null>(null);

  const { run, error: actionError, pending } = useServerAction();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) return costings;

    return costings.filter((costing) =>
      describeScope(costing).toLowerCase().includes(needle),
    );
  }, [costings, query]);

  const inForce = costings.filter((costing) => costing.isInForce);
  const replaced = costings.length - inForce.length;

  function handleCreate(draft: CostingHeaderDraft) {
    /*
     * Saved empty, on purpose. The lines are written on the editor this opens
     * into, which is the one place they live — asking for the first of them
     * here and the rest somewhere else is what made the old dialog confusing.
     */
    run(
      () => createCosting({ eventTypeId: draft.eventTypeId, slotId: draft.slotId }),
      () => setFormOpen(false),
    );
  }

  return (
    <>
      <PortalPageHeader
        title="Pooja Costings"
        description="What each pooja is expected to cost, and what its sponsor is asked for. A saved costing applies until you change it; changing one keeps the old figures for the days already quoted at them."
        meta={[
          <span key="force" className="tabular">
            {inForce.length} in use
          </span>,
          <span key="replaced" className="tabular">
            {replaced} earlier version{replaced === 1 ? '' : 's'}
          </span>,
        ]}
        actions={
          canManage ? (
            <Button onClick={() => setFormOpen(true)}>
              <Plus />
              New Costing
            </Button>
          ) : undefined
        }
      />

      <ActionError message={actionError} />

      <Card>
        <CardHeader
          title="Versions"
          description="A costing written for one instance beats the one written for the whole type."
          action={
            <InputGroup className="w-full sm:w-56">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>

              <InputGroupInput
                type="search"
                value={query}
                placeholder="Search costings…"
                aria-label="Search costings"
                onChange={(changeEvent) => setQuery(changeEvent.target.value)}
              />
            </InputGroup>
          }
        />

        <DataTable columns={COLUMNS} minWidth={960}>
          {filtered.length === 0 ? (
            <DataTableEmpty colSpan={COLUMNS.length}>
              <EmptyState
                icon={Coins}
                title={
                  costings.length === 0
                    ? 'No costings yet'
                    : 'No costings match that search'
                }
                description={
                  costings.length === 0
                    ? 'Write one costing for a pooja type and every instance of it is covered. Add a costing for a single instance only where the money is actually different.'
                    : 'Try a different pooja name, or clear the search.'
                }
              />
            </DataTableEmpty>
          ) : (
            filtered.map((costing) => (
              <DataRow key={costing.id}>
                <DataCell>
                  <Link
                    href={costingRoute(costing.id)}
                    className="font-medium text-text-primary hover:underline"
                  >
                    {describeScope(costing)}
                  </Link>

                  <p className="text-xs text-text-muted">
                    {describeScopeReach(costing)}
                  </p>
                </DataCell>

                <DataCell nowrap className="tabular text-xs text-text-secondary">
                  {describePeriod(costing)}
                </DataCell>

                <DataCell nowrap>
                  <StatusBadge status={costingBadge(costing)} />
                </DataCell>

                <DataCell align="right" nowrap className="tabular">
                  {formatCurrency(costing.sponsorAmount)}
                </DataCell>

                <DataCell align="right" nowrap className="tabular text-text-secondary">
                  {formatCurrency(costing.expenseTotal)}
                </DataCell>

                <DataCell align="right" nowrap className="tabular">
                  {costing.usedByEvents > 0 ? (
                    costing.usedByEvents
                  ) : (
                    <span className="text-text-disabled">—</span>
                  )}
                </DataCell>

                <DataCell align="right" nowrap>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={costingRoute(costing.id)}>
                        {canManage && costing.isInForce ? 'Edit' : 'Open'}
                      </Link>
                    </Button>

                    {canManage && (
                      <>
                        {/*
                          * Copy writes day two of a festival from day one, and
                          * starts a fresh version from a replaced one.
                          */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCopying(costing)}
                        >
                          Copy
                        </Button>

                        {costing.isInForce && costing.usedByEvents === 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pending}
                            className="text-danger hover:bg-danger-subtle hover:text-danger"
                            onClick={() => setPendingDelete(costing)}
                          >
                            Delete
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </DataCell>
              </DataRow>
            ))
          )}
        </DataTable>
      </Card>

      <CostingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        eventTypes={eventTypes}
        onSubmit={handleCreate}
      />

      <CopyCostingDialog
        open={copying !== null}
        onOpenChange={(next) => !next && setCopying(null)}
        costing={copying}
        onSubmit={(input) => {
          const source = copying;

          if (!source) return;

          run(() => copyCosting(source.id, input), () => setCopying(null));
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this costing?"
        description={
          pendingDelete
            ? `The costing for ${describeScope(pendingDelete)} will be removed. Only a version nothing was costed from can be deleted.`
            : ''
        }
        onConfirm={() => {
          const target = pendingDelete;

          if (!target) return;

          run(() => deleteCosting(target.id), () => setPendingDelete(null));
        }}
      />
    </>
  );
}
