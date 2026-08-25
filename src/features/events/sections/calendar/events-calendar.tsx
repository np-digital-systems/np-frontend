'use client';

import { useMemo, useState } from 'react';
import { CalendarPlus, Download } from 'lucide-react';

import {
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
import { deriveStatus, isOverdue, summarise } from '../../lib/event-data';
import { materialiseEvent } from '../../lib/event-draft';
import type { EventRecord, EventType, SponsorUser } from '../../types';

import { EventsTable } from './events-table';
import { MonthGrid } from './month-grid';

const VIEWS = ['List', 'Month'] as const;
type View = (typeof VIEWS)[number];

interface EventsCalendarProps {
  initialEvents: readonly EventRecord[];
  eventTypes: readonly EventType[];
  sponsors: readonly SponsorUser[];
  access: EventAccess;
  /** Resolved on the server so the two renders agree on what "today" is. */
  today: string;
  year: number;
}

/**
 * The events calendar screen.
 *
 * Holds the working copy of the calendar so create, edit and delete land
 * immediately. Every write path is behind the capability booleans resolved
 * on the server — this component decides *when* an action is offered, never
 * *whether* the role has it.
 *
 * TODO: replace the local mutations with calls to the events API. The
 * handlers below are already the shape those calls will take.
 */
export function EventsCalendar({
  initialEvents,
  eventTypes,
  sponsors,
  access,
  today,
  year,
}: EventsCalendarProps) {
  const [events, setEvents] = useState<readonly EventRecord[]>(initialEvents);
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

  function handleSubmit(draft: EventDraft) {
    setEvents((current) => {
      if (editing) {
        return current.map((event) =>
          event.id === editing.id
            ? materialiseEvent(draft, {
                id: editing.id,
                createdAt: editing.createdAt,
                eventTypes,
                sponsors,
                today,
              })
            : event,
        );
      }

      const nextId =
        current.reduce((highest, event) => Math.max(highest, event.id), 0) + 1;

      return [
        ...current,
        materialiseEvent(draft, {
          id: nextId,
          createdAt: new Date().toISOString(),
          eventTypes,
          sponsors,
          today,
        }),
      ];
    });
  }

  function handleToggleComplete(target: EventRecord) {
    setEvents((current) =>
      current.map((event) => {
        if (event.id !== target.id) return event;

        const updated = { ...event, isCompleted: !event.isCompleted };

        return { ...updated, status: deriveStatus(updated, today) };
      }),
    );
  }

  function handleDelete() {
    if (!pendingDelete) return;

    setEvents((current) =>
      current.filter((event) => event.id !== pendingDelete.id),
    );

    setPendingDelete(null);
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

/**
 * Filtering lives here rather than in the toolbar so both views and the
 * summary read one definition of what "matches" means.
 */
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
        if (event.sponsorId !== null) return false;
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
      event.sponsor?.fullName ?? '',
      event.notes ?? '',
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}
