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
import { Plus, Search, Tag, X } from 'lucide-react';

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

import { EventName } from '../../components/event-name';
import {
  EventTypeFormDialog,
  type EventTypeDraft,
} from '../../components/event-type-form-dialog';
import { FrequencyBadge } from '../../components/frequency-badge';
import { FREQUENCY_LABELS, FREQUENCY_TYPES } from '../../lib/event-data';
import { EventSlotsDialog } from '../../components/event-slots-dialog';
import type { EventSlot, EventTypeRecord, FrequencyType } from '../../types';

import type { ActivityRef } from '@/features/accounting/types';

/*
 * The year rides on the column it qualifies. It used to be said once in the
 * card's heading — "scheduling shown for 2026" — and taking that heading away
 * to match the other registries would have left a count of dated events with
 * nothing saying which year they were dated in.
 */
const columnsFor = (year: number): DataColumn[] => [
  { key: 'name', label: 'Event Type' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'instances', label: 'Instances', align: 'right' },
  { key: 'slots', label: 'Sponsor Slots', align: 'right' },
  { key: 'scheduled', label: `${year} Scheduled`, align: 'right' },
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
  const columns = useMemo(() => columnsFor(year), [year]);

  const [query, setQuery] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType | 'all'>('all');
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

    return types.filter((type) => {
      if (frequency !== 'all' && type.frequencyType !== frequency) return false;

      if (!needle) return true;

      return `${type.name} ${type.nameEn} ${FREQUENCY_LABELS[type.frequencyType]}`
        .toLowerCase()
        .includes(needle);
    });
  }, [types, query, frequency]);

  

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  const { run, error: actionError, pending } = useServerAction();

  function handleSubmit(draft: EventTypeDraft) {
    const target = editing;
    const input = {
      nameTa: draft.name,
      nameEn: draft.nameEn,
      frequencyType: draft.frequencyType,
      funding: draft.funding,
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
        description="Every recurring pooja and festival the temple keeps."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New Event Type
          </Button>
        }
      />

      <ActionError message={actionError} />

      {/*
        * The same toolbar the calendar and the sponsorships list carry: search
        * on the left, the filters beside it, the table in a plain card below.
        * It sat inside the card's own heading here, which made this the one
        * registry in the portal that looked like a different application.
        */}
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-64">
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

        <Select
          value={frequency}
          onValueChange={(value) => setFrequency(value as FrequencyType | 'all')}
        >
          <SelectTrigger aria-label="Filter by frequency">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All frequencies</SelectItem>

            {FREQUENCY_TYPES.map((option) => (
              <SelectItem key={option} value={option}>
                {FREQUENCY_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(query.trim() !== '' || frequency !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setFrequency('all');
            }}
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      <Card>
        <DataTable columns={columns} minWidth={820}>
          {filtered.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
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
                      * Named from the type itself: this is the one place an
                      * instance can be named before any date or sponsor for it
                      * exists. "Names" rather than "Slots" because naming is
                      * the only thing the dialog does.
                      */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSlots(type)}
                    >
                      Names
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
        pending={pending}
        onSave={(changes) => {
          /*
           * One write per changed name, stopping at the first refusal. A batch
           * endpoint would be tidier, but the committee names a year in one
           * sitting and then leaves it alone: this runs two or three times on
           * the day a festival is set up and never again.
           */
          run(
            async () => {
              for (const change of changes) {
                const result = await updateEventSlot(change.slotId, {
                  customInstanceName: change.customInstanceName,
                });

                if (!result.ok) return result;
              }

              return { ok: true as const };
            },
            async () => {
              if (slotsOf) setSlots(await loadEventSlots(slotsOf.id));
            },
          );
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
