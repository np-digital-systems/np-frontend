'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { EventAccess } from '../../lib/event-access';
import { buildMonthGrid, shiftMonth, WEEKDAY_INITIALS } from '../../lib/calendar-grid';
import { formatTime, monthName } from '../../lib/event-data';
import type { EventRecord } from '../../types';

interface MonthGridProps {
  events: readonly EventRecord[];
  year: number;
  month: number;
  today: string;
  access: EventAccess;
  onMonthChange: (next: { year: number; month: number }) => void;
  onSelect: (event: EventRecord) => void;
}

export function MonthGrid({
  events,
  year,
  month,
  today,
  access,
  onMonthChange,
  onSelect,
}: MonthGridProps) {
  const weeks = buildMonthGrid(year, month);

  const byDate = new Map<string, EventRecord[]>();

  for (const event of events) {
    const bucket = byDate.get(event.scheduledDate);

    if (bucket) {
      bucket.push(event);
    } else {
      byDate.set(event.scheduledDate, [event]);
    }
  }

  const monthTotal = events.filter((event) =>
    event.scheduledDate.startsWith(
      `${year}-${String(month).padStart(2, '0')}`,
    ),
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold text-text-primary">
            {monthName(month)} {year}
          </h2>
          <p className="mt-0.5 text-xs text-text-muted tabular">
            {monthTotal} {monthTotal === 1 ? 'event' : 'events'} this month
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => onMonthChange(shiftMonth(year, month, -1))}
          >
            <ChevronLeft />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next month"
            onClick={() => onMonthChange(shiftMonth(year, month, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px] p-3">
          <div
            className="grid grid-cols-7 gap-1.5 pb-1.5"
            role="row"
            aria-hidden
          >
            {WEEKDAY_INITIALS.map((weekday) => (
              <div
                key={weekday}
                className="px-1 text-[11px] font-medium text-text-muted"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {weeks.flat().map((day) => {
              const dayEvents = byDate.get(day.iso) ?? [];
              const isToday = day.iso === today;

              return (
                <div
                  key={day.iso}
                  className={cn(
                    'flex min-h-[92px] flex-col gap-1 rounded-lg border p-1.5',
                    day.inMonth
                      ? 'border-border bg-surface'
                      : 'border-transparent bg-surface-2/50',
                    isToday && 'border-primary/40 bg-primary-subtle',
                  )}
                >
                  <span
                    className={cn(
                      'px-0.5 text-[11px] tabular',
                      day.inMonth ? 'text-text-secondary' : 'text-text-disabled',
                      isToday && 'font-semibold text-primary',
                    )}
                  >
                    {day.day}
                  </span>

                  {dayEvents.map((event) => (
                    <EventChip
                      key={event.id}
                      event={event}
                      interactive={access.canUpdate}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface EventChipProps {
  event: EventRecord;
    interactive: boolean;
  onSelect: (event: EventRecord) => void;
}

function EventChip({ event, interactive, onSelect }: EventChipProps) {
  const label = `${event.eventType.name} — ${event.instanceLabel}`;

  const content = (
    <>
      <span className="block truncate font-medium">{label}</span>
      <span className="block truncate opacity-70 tabular">
        {formatTime(event.startTime)}
      </span>
    </>
  );

  const className = cn(
    'w-full rounded-md px-1.5 py-1 text-left text-[11px] leading-tight',
    event.isCompleted
      ? 'bg-success-subtle text-success'
      : event.sponsorId
        ? 'bg-info-subtle text-info'
        : 'bg-warning-subtle text-warning',
  );

  if (!interactive) {
    return (
      <span className={className} title={label}>
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className={cn(
        className,
        'transition-opacity hover:opacity-80',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring',
      )}
      aria-label={`Edit ${label}`}
    >
      {content}
    </button>
  );
}
