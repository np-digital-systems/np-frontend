import Image from 'next/image';
import {
  ArrowLeft,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { PageContainer } from '@/components/site/page-container';
import { SpiritualDivider } from '@/components/site/spiritual-divider';
import { Link, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

import {
  eventImage,
  eventName,
  formatEventDate,
  formatTimeRange,
  formatWeekday,
  instanceLabel,
} from '../../lib/public-event-presentation';
import type { PublicEvent } from '../../types';

import { SiteEventCard } from './site-event-card';

interface EventDetailProps {
  event: PublicEvent;
  /** A few other occurrences to offer once this one has been read. */
  alsoUpcoming: readonly PublicEvent[];
  today: string;
}

type Standing = 'completed' | 'today' | 'upcoming' | 'past';

function standingOf(event: PublicEvent, today: string): Standing {
  if (event.isCompleted) return 'completed';
  if (event.scheduledDate === today) return 'today';

  return event.scheduledDate > today ? 'upcoming' : 'past';
}

const STANDING_STYLES: Record<Standing, string> = {
  completed: 'bg-[#EDF6EF] text-[#256B3A] border-[#256B3A]/20',
  today: 'bg-[#FDE8E4] text-[#8B0000] border-[#8B0000]/20',
  upcoming: 'bg-[#FFF8E1] text-[#735C00] border-[#D4AF37]/40',
  past: 'bg-[#F3F3F4] text-[#6F6757] border-[#D0C5AF]/50',
};

/**
 * One occurrence, in full.
 *
 * The calendar holds no photographs and only one free-text field, so the page
 * leans on what it does hold — the date, the slot in the year, the hours — and
 * says plainly when there is nothing more to say rather than padding it out.
 */
export function EventDetail({ event, alsoUpcoming, today }: EventDetailProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations('Events.detail');
  const tInstance = useTranslations('Events.instance');
  const tFrequency = useTranslations('Events.frequency');

  const title = eventName(event, locale);
  const standing = standingOf(event, today);

  const facts = [
    {
      icon: CalendarDays,
      label: t('date'),
      value: formatEventDate(event.scheduledDate, locale),
      hint: formatWeekday(event.scheduledDate, locale),
    },
    {
      icon: Clock,
      label: t('time'),
      value: formatTimeRange(event.startTime, event.endTime, locale),
      hint: event.endTime ? undefined : t('startsAt'),
    },
    {
      icon: Sparkles,
      label: t('occurrence'),
      value: instanceLabel(event, tInstance),
      hint: undefined,
    },
    {
      icon: CalendarRange,
      label: t('frequency'),
      value: tFrequency(event.frequencyType),
      hint: undefined,
    },
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative flex h-[46vh] min-h-[360px] items-end overflow-hidden">
        <Image
          src={eventImage(event.eventTypeId)}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#8B0000]/50 via-black/40 to-black/75" />

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 pb-10 md:px-16 md:pb-14">
          <Link
            href="/events"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/85 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToEvents')}
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#D4AF37] px-3 py-1 text-[11px] font-semibold tracking-wider text-white uppercase">
              {instanceLabel(event, tInstance)}
            </span>
            <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wider text-white uppercase backdrop-blur-sm">
              {t(`standing.${standing}`)}
            </span>
          </div>

          <h1 className="font-heading mt-4 max-w-3xl text-3xl font-bold text-white md:text-5xl">
            {title}
          </h1>

          <p className="mt-3 inline-flex items-center gap-2 text-base text-white/85">
            <CalendarDays className="h-4 w-4 text-[#D4AF37]" />
            {formatEventDate(event.scheduledDate, locale)}
            <span className="text-white/40">·</span>
            {formatTimeRange(event.startTime, event.endTime, locale)}
          </p>
        </div>
      </section>

      {/* --------------------------------------------------------------- facts */}
      <PageContainer className="bg-[#FAF9F6] !py-12 md:!py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-2xl border border-[#E8E0CC] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            >
              <fact.icon className="h-5 w-5 text-[#D4AF37]" />
              <p className="mt-3 text-[11px] font-semibold tracking-[0.12em] text-[#7F7663] uppercase">
                {fact.label}
              </p>
              <p className="font-heading mt-1 text-lg font-semibold text-[#1A1C1C]">
                {fact.value}
              </p>
              {fact.hint && (
                <p className="mt-0.5 text-xs text-[#7F7663]">{fact.hint}</p>
              )}
            </div>
          ))}
        </div>

        {/* ------------------------------------------------------ description */}
        <div className="mt-10 rounded-2xl border border-[#E8E0CC] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] md:p-10">
          <h2 className="font-heading text-2xl font-semibold text-[#1A1C1C] md:text-3xl">
            {t('about')}
          </h2>

          <div className="mt-4 mb-6 flex items-center gap-2">
            <span className="h-[2px] w-8 bg-[#D4AF37]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
          </div>

          {event.notes ? (
            <p className="text-base leading-relaxed whitespace-pre-line text-[#4D4635] md:text-lg">
              {event.notes}
            </p>
          ) : (
            <p className="text-base leading-relaxed text-[#7F7663] italic">
              {t('noDescription', { name: title })}
            </p>
          )}

          {standing === 'completed' && (
            <p
              className={cn(
                'mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium',
                STANDING_STYLES.completed,
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              {t('completedNote')}
            </p>
          )}
        </div>

        <SpiritualDivider variant="om" className="pt-4" />
      </PageContainer>

      {/* ----------------------------------------------------------- also next */}
      {alsoUpcoming.length > 0 && (
        <PageContainer className="bg-white !pt-0">
          <h2 className="font-heading mb-8 text-center text-2xl font-semibold text-[#1A1C1C] md:text-3xl">
            {t('alsoUpcoming')}
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {alsoUpcoming.map((other) => (
              <SiteEventCard key={other.id} event={other} />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#D4AF37] px-8 py-3.5 text-sm font-semibold text-[#735C00] transition-all duration-300 hover:bg-[#D4AF37] hover:text-white"
            >
              {t('viewCalendar')}
            </Link>
          </div>
        </PageContainer>
      )}
    </>
  );
}
