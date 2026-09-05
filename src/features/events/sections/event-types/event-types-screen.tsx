'use client';

import { useServerAction } from '@/hooks/use-server-action';

import {
  createEventType,
  deleteEventType,
  loadEventSlots,
  updateEventSlot,
  updateEventType,
} from '../../lib/event-actions';

import { useMemo, useState } from 'react';
import { Plus, Search, Tag } from 'lucide-react';

import {
  ActionError,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
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

import { EventName } from '../../components/event-name';
import {
  EventTypeFormDialog,
  type EventTypeDraft,
} from '../../components/event-type-form-dialog';
import { FrequencyBadge } from '../../components/frequency-badge';
import { INSTANCE_MEANING, FREQUENCY_LABELS, FREQUENCY_TYPES } from '../../lib/event-data';
import { EventSlotsDialog } from '../../components/event-slots-dialog';
import type { EventSlot, EventTypeRecord } from '../../types';

import type { ActivityRef } from '@/features/accounting/types';

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
  activities: readonly ActivityRef[];
  year: number;
}

export function EventTypesScreen({
  initialTypes,
  activities,
  year,
}: EventTypesScreenProps) {
  const types = initialTypes;
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventTypeRecord | null>(null);
  const [slotsOf, setSlotsOf] = useState<EventTypeRecord | null>(null);
  const [slots, setSlots] = useState<readonly EventSlot[]>([]);

  async function openSlots(type: EventTypeRecord) {
    setSlotsOf(type);
    setSlots(await loadEventSlots(type.id));
  }
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

  const { run, error: actionError } = useServerAction();

  function handleSubmit(draft: EventTypeDraft) {
    const target = editing;
    const input = {
      nameTa: draft.name,
      nameEn: draft.nameEn,
      frequencyType: draft.frequencyType,
      noOfInstances: draft.noOfInstances,
      activityId: draft.activityId,
    };

    run(
      () => (target ? updateEventType(target.id, input) : createEventType(input)),
      () => {
        setEditing(null);
        setFormOpen(false);
      },
    );
  }

  function handleDelete() {
    if (!pendingDelete) return;

    const target = pendingDelete;

    run(() => deleteEventType(target.id), () => setPendingDelete(null));
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

      <ActionError message={actionError} />

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
                    {/*
                      * The slots are the structure of this pooja's year, so
                      * they are opened from the type itself — the one place a
                      * slot can be named before any date or sponsor exists.
                      */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSlots(type)}
                    >
                      Slots
                    </Button>

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
        activities={activities}
        onSubmit={handleSubmit}
      />

      <EventSlotsDialog
        open={slotsOf !== null}
        onOpenChange={(next) => !next && setSlotsOf(null)}
        eventType={slotsOf}
        slots={slots}
        canManage
        onRename={(slotId, customInstanceName) => {
          run(() => updateEventSlot(slotId, { customInstanceName }), async () => {
            if (slotsOf) setSlots(await loadEventSlots(slotsOf.id));
          });
        }}
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
