'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, Tag } from 'lucide-react';

import {
  Card,
  CardBody,
  CardHeader,
  DataCell,
  DataRow,
  DataTable,
  DataTableEmpty,
  EmptyState,
  PortalPageHeader,
  type DataColumn,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

import { ConfirmDialog } from '../../components/confirm-dialog';
import { EventName } from '../../components/event-name';
import {
  EventTypeFormDialog,
  type EventTypeDraft,
} from '../../components/event-type-form-dialog';
import { FrequencyBadge } from '../../components/frequency-badge';
import { INSTANCE_MEANING, FREQUENCY_LABELS, FREQUENCY_TYPES } from '../../lib/event-data';
import type { EventTypeRecord } from '../../types';

const COLUMNS: DataColumn[] = [
  { key: 'name', label: 'Event Type' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'instances', label: 'Instances', align: 'right' },
  { key: 'slots', label: 'Sponsor Slots', align: 'right' },
  { key: 'scheduled', label: 'Scheduled', align: 'right' },
  { key: 'actions', label: 'Actions', align: 'right', srOnly: true },
];

interface EventTypesScreenProps {
  initialTypes: readonly EventTypeRecord[];
  year: number;
}

/**
 * The event-type registry.
 *
 * Only reachable by a role holding `event-type:manage`, so unlike the
 * calendar this screen has no read-only mode to render — the page boundary
 * has already refused anyone else.
 *
 * TODO: replace the local mutations with calls to the event-types API.
 */
export function EventTypesScreen({ initialTypes, year }: EventTypesScreenProps) {
  const [types, setTypes] = useState<readonly EventTypeRecord[]>(initialTypes);
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventTypeRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EventTypeRecord | null>(
    null,
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) return types;

    return types.filter((type) =>
      `${type.name} ${type.nameEn} ${FREQUENCY_LABELS[type.frequencyType]}`
        .toLowerCase()
        .includes(needle),
    );
  }, [types, query]);

  const totalInstances = types.reduce(
    (sum, type) => sum + type.noOfInstances,
    0,
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleSubmit(draft: EventTypeDraft) {
    setTypes((current) => {
      if (editing) {
        return current.map((type) =>
          type.id === editing.id
            ? { ...type, ...draft, updatedAt: new Date().toISOString() }
            : type,
        );
      }

      const nextId =
        current.reduce((highest, type) => Math.max(highest, type.id), 0) + 1;

      const now = new Date().toISOString();

      return [
        ...current,
        {
          id: nextId,
          ...draft,
          sponsorSlots: 0,
          scheduledCount: 0,
          createdAt: now,
          updatedAt: now,
        },
      ];
    });
  }

  function handleDelete() {
    if (!pendingDelete) return;

    setTypes((current) =>
      current.filter((type) => type.id !== pendingDelete.id),
    );

    setPendingDelete(null);
  }

  return (
    <>
      <PortalPageHeader
        title="Event Types"
        description="The permanent registry of recurring poojas and festivals. Every calendar entry is an instance of one of these."
        meta={[
          <span key="types" className="tabular">
            {types.length} event types
          </span>,
          <span key="instances" className="tabular">
            {totalInstances} instances a year
          </span>,
        ]}
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New Event Type
          </Button>
        }
      />

      <InstanceReference />

      <Card>
        <CardHeader
          title="Registry"
          description={`Sponsor slots and scheduling shown for ${year}`}
          action={
            <InputGroup className="w-full sm:w-56">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>

              <InputGroupInput
                type="search"
                value={query}
                placeholder="Search event types…"
                aria-label="Search event types"
                onChange={(changeEvent) => setQuery(changeEvent.target.value)}
              />
            </InputGroup>
          }
        />

        <DataTable columns={COLUMNS} minWidth={820}>
          {filtered.length === 0 ? (
            <DataTableEmpty colSpan={COLUMNS.length}>
              <EmptyState
                icon={Tag}
                title={
                  types.length === 0
                    ? 'No event types yet'
                    : 'No event types match that search'
                }
                description={
                  types.length === 0
                    ? 'Create the temple’s recurring poojas and festivals to start building the calendar.'
                    : 'Try a different name or clear the search.'
                }
              />
            </DataTableEmpty>
          ) : (
            filtered.map((type) => (
              <DataRow key={type.id}>
                <DataCell>
                  <EventName name={type.name} nameEn={type.nameEn} />
                </DataCell>

                <DataCell nowrap>
                  <FrequencyBadge frequency={type.frequencyType} />
                </DataCell>

                <DataCell align="right" nowrap className="tabular">
                  {type.noOfInstances}
                </DataCell>

                <DataCell align="right" nowrap className="tabular">
                  {type.sponsorSlots > 0 ? (
                    type.sponsorSlots
                  ) : (
                    <span className="text-text-disabled">—</span>
                  )}
                </DataCell>

                <DataCell align="right" nowrap className="tabular">
                  {type.scheduledCount > 0 ? (
                    type.scheduledCount
                  ) : (
                    <span className="text-text-disabled">—</span>
                  )}
                </DataCell>

                <DataCell align="right" nowrap>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(type);
                        setFormOpen(true);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:bg-danger-subtle hover:text-danger"
                      onClick={() => setPendingDelete(type)}
                    >
                      Delete
                    </Button>
                  </div>
                </DataCell>
              </DataRow>
            ))
          )}
        </DataTable>
      </Card>

      <EventTypeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        eventType={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this event type?"
        description={
          pendingDelete
            ? `${pendingDelete.name} will be removed along with its ${pendingDelete.sponsorSlots} sponsor slot${pendingDelete.sponsorSlots === 1 ? '' : 's'}. Event types with events already on the calendar cannot be deleted.`
            : ''
        }
        onConfirm={handleDelete}
      />
    </>
  );
}

/**
 * What `instance_identifier` means, per frequency.
 *
 * The column is deliberately adaptive in the schema; without this reference
 * the admin has to remember that a `2` means the second festival day for one
 * type and Theipirai for another.
 */
function InstanceReference() {
  return (
    <Card>
      <CardHeader
        title="How instances are numbered"
        description="The instance number on an event means something different for each frequency."
      />

      <CardBody className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {FREQUENCY_TYPES.map((frequency) => (
          <div key={frequency} className="flex flex-col gap-1">
            <FrequencyBadge frequency={frequency} className="self-start" />

            <p className="text-xs leading-snug text-text-secondary">
              {INSTANCE_MEANING[frequency]}
            </p>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
