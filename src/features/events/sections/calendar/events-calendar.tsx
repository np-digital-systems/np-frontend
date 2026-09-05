'use client';

import { useServerAction } from '@/hooks/use-server-action';

import {
  completeEvent,
  createEvent,
  deleteEvent,
  reopenEvent,
  updateEvent,
} from '../../lib/event-actions';

import { useMemo, useState } from 'react';
import { CalendarPlus, Download } from 'lucide-react';

import {
  ActionError,
  Card,
  ConfirmDialog,
  PortalPageHeader,
  ReadOnlyNotice,
  SegmentedControl,
  StatCard,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';

import {
  EventFormDialog,
  type EventDraft,
} from '../../components/event-form-dialog';
import {
  EMPTY_FILTERS,
  EventsToolbar,
  type EventFilters,
} from '../../components/events-toolbar';
import { READ_ONLY_MESSAGE, type EventAccess } from '../../lib/event-access';
import { isOverdue, summarise } from '../../lib/event-data';
import type {
  EventRecord,
  EventType,
  SponsorAssignment,
  SponsorParty,
} from '../../types';

import { EventsTable } from './events-table';
import { MonthGrid } from './month-grid';

const VIEWS = ['List', 'Month'] as const;
type View = (typeof VIEWS)[number];

interface EventsCalendarProps {
  initialEvents: readonly EventRecord[];
  eventTypes: readonly EventType[];
  sponsors: readonly SponsorParty[];
  assignments: readonly SponsorAssignment[];
  access: EventAccess;
    today: string;
  year: number;
}

/**
 * TODO: replace the local mutations with calls to the events API. The
 * handlers below are already the shape those calls will take.
 */
export function EventsCalendar({
  initialEvents,
  eventTypes,
  sponsors,
  assignments,
  access,
  today,
  year,
}: EventsCalendarProps) {
  const events = initialEvents;
  const [filters, setFilters] = useState<EventFilters>(EMPTY_FILTERS);
  const [view, setView] = useState<View>('List');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EventRecord | null>(null);

  const [visibleMonth, setVisibleMonth] = useState(() => ({
    year: Number(today.slice(0, 4)),
    month: Number(today.slice(5, 7)),
  }));

  const filtered = useMemo(
    () => applyFilters(events, filters, today),
    [events, filters, today],
  );

  const summary = useMemo(() => summarise(events, today), [events, today]);

  const overdueCount = useMemo(
    () => events.filter((event) => isOverdue(event, today)).length,
    [events, today],
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(event: EventRecord) {
    setEditing(event);
    setFormOpen(true);
  }

  const { run, error: actionError } = useServerAction();

  function handleSubmit(draft: EventDraft) {
    const target = editing;

    run(
      () =>
        target
          ? updateEvent(target.id, {
              scheduledDate: draft.scheduledDate,
              startTime: draft.startTime,
              endTime: draft.endTime || null,
              sponsorPartyId: draft.sponsorPartyId,
              notes: draft.notes || null,
            })
          : createEvent({
              eventTypeId: draft.eventTypeId,
              instanceIdentifier: draft.instanceIdentifier,
              scheduledDate: draft.scheduledDate,
              startTime: draft.startTime,
              endTime: draft.endTime || null,
              sponsorPartyId: draft.sponsorPartyId,
              notes: draft.notes || null,
            }),
      () => {
        setEditing(null);
        setFormOpen(false);
      },
    );
  }

  function handleToggleComplete(target: EventRecord) {
    run(() => (target.isCompleted ? reopenEvent(target.id) : completeEvent(target.id)));
  }

  function handleDelete() {
    if (!pendingDelete) return;

    const target = pendingDelete;

    run(() => deleteEvent(target.id), () => setPendingDelete(null));
  }

  return (
    <>
      <PortalPageHeader
        title="Event Calendar"
        description="Every pooja, festival day and recurring observance scheduled for the temple year."
        meta={[
          <span key="year" className="tabular">
            Calendar year {year}
          </span>,
          <span key="count" className="tabular">
            {summary.total} scheduled
          </span>,
          overdueCount > 0 ? (
            <span key="overdue" className="text-warning tabular">
              {overdueCount} awaiting closing
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          <>
            {access.canExport && (
              <Button variant="outline">
                <Download />
                Export
              </Button>
            )}

            {access.canCreate && (
              <Button onClick={openCreate}>
                <CalendarPlus />
                New Event
              </Button>
            )}
          </>
        }
      />

      <ActionError message={actionError} />

      {!access.canWrite && <ReadOnlyNotice message={READ_ONLY_MESSAGE} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Events"
          value={String(summary.total)}
          caption={`Calendar year ${year}`}
        />
        <StatCard
          label="Upcoming"
          value={String(summary.upcoming)}
          caption="Still ahead"
        />
        <StatCard
          label="Completed"
          value={String(summary.completed)}
          caption="Closed and recorded"
        />
        <StatCard
          label="Unsponsored"
          value={String(summary.unsponsored)}
          caption="Slots awaiting a devotee"
        />
      </div>

      <EventsToolbar
        filters={filters}
        onChange={setFilters}
        eventTypes={eventTypes}
        trailing={
          <SegmentedControl
            label="Calendar view"
            options={VIEWS}
            value={view}
            onChange={setView}
          />
        }
      />

      <Card>
        {view === 'List' ? (
          <EventsTable
            events={filtered}
            access={access}
            today={today}
            onEdit={openEdit}
            onDelete={setPendingDelete}
            onToggleComplete={handleToggleComplete}
          />
        ) : (
          <MonthGrid
            events={filtered}
            year={visibleMonth.year}
            month={visibleMonth.month}
            today={today}
            access={access}
            onMonthChange={setVisibleMonth}
            onSelect={openEdit}
          />
        )}
      </Card>

      {access.canWrite && (
        <EventFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          event={editing}
          eventTypes={eventTypes}
          sponsors={sponsors}
          assignments={assignments}
          canComplete={access.canComplete}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this event?"
        description={
          pendingDelete
            ? `${pendingDelete.eventType.name} — ${pendingDelete.instanceLabel} on ${pendingDelete.scheduledDate} will be removed from the calendar. This cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
      />
    </>
  );
}

function applyFilters(
  events: readonly EventRecord[],
  filters: EventFilters,
  today: string,
): readonly EventRecord[] {
  const query = filters.query.trim().toLowerCase();

  return events.filter((event) => {
    if (
      filters.eventTypeId !== 'all' &&
      event.eventTypeId !== filters.eventTypeId
    ) {
      return false;
    }

    if (
      filters.frequency !== 'all' &&
      event.eventType.frequencyType !== filters.frequency
    ) {
      return false;
    }

    switch (filters.status) {
      case 'upcoming':
        if (event.isCompleted || event.scheduledDate < today) return false;
        break;
      case 'completed':
        if (!event.isCompleted) return false;
        break;
      case 'overdue':
        if (!isOverdue(event, today)) return false;
        break;
      case 'unsponsored':
        if (event.sponsorPartyId !== null) return false;
        break;
      case 'all':
        break;
    }

    if (!query) return true;

    return [
      event.eventType.name,
      event.eventType.nameEn,
      event.instanceLabel,
      event.customInstanceName ?? '',
      event.sponsor?.name ?? '',
      event.notes ?? '',
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}
