'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

import {
  buildMonthGrid,
  monthPrefix,
  shiftMonth,
} from '../../lib/public-calendar-grid';
import {
  eventName,
  formatEventDate,
  formatMonthTitle,
  formatTimeRange,
  formatWeekday,
  instanceLabel,
  sponsorName,
  weekdayInitials,
} from '../../lib/public-event-presentation';
import type { PublicEvent } from '../../types';

interface EventsCalendarViewProps {
  events: readonly PublicEvent[];
  /** Today in the temple's timezone, computed on the server. */
  today: string;
}

export function EventsCalendarView({ events, today }: EventsCalendarViewProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations('Events.calendar');
  const tInstance = useTranslations('Events.instance');

  const [cursor, setCursor] = useState(() => ({
    year: Number(today.slice(0, 4)),
    month: Number(today.slice(5, 7)),
  }));
  const [selected, setSelected] = useState<string | null>(today);

  const byDate = useMemo(() => {
    const map = new Map<string, PublicEvent[]>();

    for (const event of events) {
      const bucket = map.get(event.scheduledDate);

      if (bucket) bucket.push(event);
      else map.set(event.scheduledDate, [event]);
    }

    return map;
  }, [events]);

  const weeks = buildMonthGrid(cursor.year, cursor.month);
  const weekdays = weekdayInitials(locale);
  const prefix = monthPrefix(cursor.year, cursor.month);

  const monthCount = events.filter((event) =>
    event.scheduledDate.startsWith(prefix),
  ).length;

  const selectedEvents = selected ? (byDate.get(selected) ?? []) : [];

  // When paging months, select the month's first event so the panel never shows an off-screen day.
  const goToMonth = (delta: number) => {
    const next = shiftMonth(cursor.year, cursor.month, delta);
    const nextPrefix = monthPrefix(next.year, next.month);

    setCursor(next);
    setSelected(
      events.find((event) => event.scheduledDate.startsWith(nextPrefix))
        ?.scheduledDate ?? null,
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-8">
      <div className="overflow-hidden rounded-2xl border border-temple-sand bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-4 border-b border-temple-sand bg-gradient-to-r from-temple-sand to-white px-5 py-4">
          <div className="min-w-0">
            <h3 className="font-heading truncate text-lg font-semibold text-temple-ink md:text-xl">
              {formatMonthTitle(cursor.year, cursor.month, locale)}
            </h3>
            <p className="mt-0.5 text-xs text-temple-soft">
              {t('eventsThisMonth', { count: monthCount })}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <CalendarNavButton
              label={t('previousMonth')}
              onClick={() => goToMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </CalendarNavButton>
            <CalendarNavButton
              label={t('nextMonth')}
              onClick={() => goToMonth(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </CalendarNavButton>
          </div>
        </div>

        <div className="p-3 md:p-4">
          <div className="grid grid-cols-7 gap-1 pb-2 md:gap-1.5">
            {weekdays.map((weekday, index) => (
              <div
                key={index}
                className="px-1 text-center text-[11px] font-semibold tracking-wide text-temple-soft uppercase"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-1.5">
            {weeks.flat().map((day) => {
              const dayEvents = byDate.get(day.iso) ?? [];
              const isToday = day.iso === today;
              const isSelected = day.iso === selected;
              const hasEvents = dayEvents.length > 0;

              return (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => setSelected(day.iso)}
                  aria-pressed={isSelected}
                  aria-label={`${formatEventDate(day.iso, locale)} — ${t('eventCount', { count: dayEvents.length })}`}
                  className={cn(
                    'relative flex min-h-[52px] flex-col items-center justify-start gap-1 rounded-lg border p-1.5 transition-all duration-200 md:min-h-[76px]',
                    'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-temple-gold',
                    day.inMonth
                      ? 'border-temple-sand bg-white'
                      : 'border-transparent bg-temple-paper',
                    hasEvents && day.inMonth && 'border-temple-gold/35 bg-temple-card',
                    isToday && 'ring-1 ring-temple-kumkum/30',
                    isSelected &&
                      'border-temple-gold bg-temple-sand shadow-[0_2px_10px_rgba(217,164,58,0.2)]',
                    day.inMonth && 'hover:border-temple-gold/60 hover:bg-temple-sand/60',
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-medium md:text-sm',
                      day.inMonth ? 'text-temple-ink' : 'text-[#C4BDAC]',
                      isToday && 'font-bold text-temple-kumkum',
                    )}
                  >
                    {day.day}
                  </span>

                  {hasEvents && (
                    <span className="flex flex-wrap items-center justify-center gap-0.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <span
                          key={event.id}
                          className={cn(
                            'block h-1.5 w-1.5 rounded-full',
                            event.isCompleted ? 'bg-[#C4BDAC]' : 'bg-temple-gold',
                          )}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] leading-none font-semibold text-temple-gold-ink">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-temple-sand bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:p-6">
        {selected ? (
          <>
            <p className="text-xs font-semibold tracking-[0.15em] text-temple-gold uppercase">
              {formatWeekday(selected, locale)}
            </p>
            <h3 className="font-heading mt-1 text-xl font-semibold text-temple-ink">
              {formatEventDate(selected, locale)}
            </h3>
            <div className="mt-4 mb-5 flex items-center gap-2">
              <span className="h-[2px] w-8 bg-temple-gold" />
              <span className="h-1.5 w-1.5 rounded-full bg-temple-gold" />
            </div>

            {selectedEvents.length > 0 ? (
              <ul className="space-y-3">
                {selectedEvents.map((event) => {
                  const slot = instanceLabel(event, tInstance);
                  const sponsor = sponsorName(event, locale);

                  return (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.id}`}
                      className="group block rounded-xl border border-temple-sand bg-temple-paper p-4 transition-all duration-300 hover:border-temple-gold/60 hover:bg-temple-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-temple-gold"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-heading text-base leading-snug font-semibold text-temple-ink">
                          {eventName(event, locale)}
                        </h4>
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-temple-gold transition-transform group-hover:translate-x-0.5" />
                      </div>

                      {slot && (
                        <p className="mt-1.5 text-xs font-medium text-temple-gold-ink">
                          {slot}
                        </p>
                      )}

                      <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-temple-soft">
                        <Clock className="h-3.5 w-3.5 text-temple-gold" />
                        {formatTimeRange(event.startTime, event.endTime, locale)}
                      </p>

                      {sponsor && (
                        <p className="mt-1.5 inline-flex items-start gap-1.5 text-xs text-temple-soft">
                          <HeartHandshake className="mt-px h-3.5 w-3.5 shrink-0 text-temple-gold" />
                          <span>
                            {t('sponsoredBy')}{' '}
                            <span className="font-semibold text-temple-gold-ink">
                              {sponsor}
                            </span>
                          </span>
                        </p>
                      )}
                    </Link>
                  </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyPanel message={t('noEventsOnDay')} />
            )}
          </>
        ) : (
          <EmptyPanel message={t('pickADay')} />
        )}
      </div>
    </div>
  );
}

function CalendarNavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-temple-sand bg-white text-temple-gold-ink transition-all duration-300 hover:border-temple-gold hover:bg-temple-gold hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-temple-gold"
    >
      {children}
    </button>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <CalendarDays className="h-8 w-8 text-temple-gold/50" />
      <p className="max-w-[22ch] text-sm text-temple-soft">{message}</p>
    </div>
  );
}
