'use client';

import { CalendarX, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import {
  DataCell,
  DataRow,
  DataTable,
  DataTableEmpty,
  EmptyState,
  StatusBadge,
  type DataColumn,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EventName } from '../../components/event-name';
import { FrequencyBadge } from '../../components/frequency-badge';
import { SponsorCell } from '../../components/sponsor-cell';
import type { EventAccess } from '../../lib/event-access';
import {
  formatShortDate,
  formatTimeRange,
  formatWeekday,
  groupByMonth,
  isOverdue,
} from '../../lib/event-data';
import type { EventRecord } from '../../types';

interface EventsTableProps {
  events: readonly EventRecord[];
  access: EventAccess;
  today: string;
  onEdit: (event: EventRecord) => void;
  onDelete: (event: EventRecord) => void;
  onToggleComplete: (event: EventRecord) => void;
}

/**
 * The calendar as a ledger.
 *
 * Rows are grouped under a month band rather than repeating the month in
 * every date cell — a temple year is read month by month, and the band is
 * what makes a long list scannable without pagination.
 */
export function EventsTable({
  events,
  access,
  today,
  onEdit,
  onDelete,
  onToggleComplete,
}: EventsTableProps) {
  const showActions = access.canUpdate || access.canDelete || access.canComplete;

  const columns: DataColumn[] = [
    { key: 'date', label: 'Date' },
    { key: 'event', label: 'Event' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'time', label: 'Time' },
    ...(access.canViewSponsors
      ? [{ key: 'sponsor', label: 'Sponsor' } as const]
      : []),
    { key: 'status', label: 'Status' },
    ...(showActions
      ? [{ key: 'actions', label: 'Actions', align: 'right', srOnly: true } as const]
      : []),
  ];

  const months = groupByMonth(events);

  return (
    <DataTable columns={columns} minWidth={access.canViewSponsors ? 940 : 780}>
      {months.length === 0 ? (
        <DataTableEmpty colSpan={columns.length}>
          <EmptyState
            icon={CalendarX}
            title="No events match these filters"
            description="Adjust the search or filters above to see more of the calendar."
          />
        </DataTableEmpty>
      ) : (
        months.map((month) => (
          <MonthBand
            key={month.key}
            label={month.label}
            count={month.events.length}
            colSpan={columns.length}
            events={month.events}
            access={access}
            today={today}
            showActions={showActions}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
          />
        ))
      )}
    </DataTable>
  );
}

interface MonthBandProps extends Omit<EventsTableProps, 'events'> {
  label: string;
  count: number;
  colSpan: number;
  events: readonly EventRecord[];
  showActions: boolean;
}

/**
 * A fragment rather than a component boundary per row: the month heading and
 * its rows have to be siblings inside `<tbody>` for the table to stay valid.
 */
function MonthBand({
  label,
  count,
  colSpan,
  events,
  access,
  today,
  showActions,
  onEdit,
  onDelete,
  onToggleComplete,
}: MonthBandProps) {
  return (
    <>
      <tr className="bg-surface-2">
        <th
          scope="colgroup"
          colSpan={colSpan}
          className="px-4 py-1.5 text-left text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase"
        >
          {label}
          <span className="ml-2 font-normal normal-case tracking-normal tabular">
            {count} {count === 1 ? 'event' : 'events'}
          </span>
        </th>
      </tr>

      {events.map((event) => (
        <DataRow key={event.id}>
          <DataCell nowrap>
            <span className="text-[13px] font-medium text-text-primary tabular">
              {formatShortDate(event.scheduledDate)}
            </span>
            <span className="ml-1.5 text-xs text-text-muted">
              {formatWeekday(event.scheduledDate).slice(0, 3)}
            </span>
          </DataCell>

          <DataCell>
            <EventName
              name={event.eventType.name}
              nameEn={event.eventType.nameEn}
              instanceLabel={event.instanceLabel}
            />
          </DataCell>

          <DataCell nowrap>
            <FrequencyBadge frequency={event.eventType.frequencyType} />
          </DataCell>

          <DataCell nowrap className="text-xs text-text-secondary tabular">
            {formatTimeRange(event.startTime, event.endTime)}
          </DataCell>

          {access.canViewSponsors && (
            <DataCell>
              <SponsorCell
                sponsor={event.sponsor}
                showContact={access.canSeeSponsorContact}
              />
            </DataCell>
          )}

          <DataCell nowrap>
            <StatusBadge
              status={
                isOverdue(event, today) ? 'Pending Approval' : event.status
              }
            />

            {isOverdue(event, today) && (
              <span className="sr-only">Past date, not yet marked complete</span>
            )}
          </DataCell>

          {showActions && (
            <DataCell align="right" nowrap>
              <RowActions
                event={event}
                access={access}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
              />
            </DataCell>
          )}
        </DataRow>
      ))}
    </>
  );
}

interface RowActionsProps {
  event: EventRecord;
  access: EventAccess;
  onEdit: (event: EventRecord) => void;
  onDelete: (event: EventRecord) => void;
  onToggleComplete: (event: EventRecord) => void;
}

/**
 * Only the actions this role actually holds are rendered — a disabled
 * button that a cashier can never enable is noise, not information.
 */
function RowActions({
  event,
  access,
  onEdit,
  onDelete,
  onToggleComplete,
}: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {access.canUpdate && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(event)}
          aria-label={`Edit ${event.eventType.name} — ${event.instanceLabel}`}
        >
          <Pencil />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`More actions for ${event.eventType.name}`}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {access.canComplete && (
            <DropdownMenuItem onSelect={() => onToggleComplete(event)}>
              {event.isCompleted ? 'Reopen event' : 'Mark as completed'}
            </DropdownMenuItem>
          )}

          {access.canUpdate && (
            <DropdownMenuItem onSelect={() => onEdit(event)}>
              Edit details
            </DropdownMenuItem>
          )}

          {access.canDelete && (
            <>
              {(access.canComplete || access.canUpdate) && (
                <DropdownMenuSeparator />
              )}

              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onDelete(event)}
              >
                <Trash2 />
                Delete event
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
