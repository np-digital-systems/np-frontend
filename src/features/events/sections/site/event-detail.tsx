import {
  ArrowLeft,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { PageContainer } from '@/components/site/page-container';
import { PageHero } from '@/components/site/page-hero';
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
  sponsorName,
} from '../../lib/public-event-presentation';
import type { PublicEvent } from '../../types';

import { SiteEventCard } from './site-event-card';

interface EventDetailProps {
  event: PublicEvent;
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
  today: 'bg-[#FDE8E4] text-temple-kumkum border-temple-kumkum/20',
  upcoming: 'bg-temple-sand text-temple-gold-ink border-temple-gold/40',
  past: 'bg-temple-sand text-temple-soft border-temple-sand/50',
};

export function EventDetail({ event, alsoUpcoming, today }: EventDetailProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations('Events.detail');
  const tInstance = useTranslations('Events.instance');
  const tFrequency = useTranslations('Events.frequency');

  const title = eventName(event, locale);
  const standing = standingOf(event, today);
  const slot = instanceLabel(event, tInstance);
  const sponsor = sponsorName(event, locale);

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
    ...(slot
      ? [{ icon: Sparkles, label: t('occurrence'), value: slot, hint: undefined }]
      : []),
    {
      icon: CalendarRange,
      label: t('frequency'),
      value: tFrequency(event.frequencyType),
      hint: undefined,
    },
  ];

  return (
    <>
      <PageHero
        title={title}
        image={eventImage(event.eventTypeId)}
        archImage={eventImage(event.eventTypeId)}
      >
        <div className="flex flex-col items-center gap-4 lg:items-start">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {slot && (
              <span className="rounded-full bg-temple-gold px-3 py-1 text-[11px] font-semibold tracking-wider text-temple-night uppercase">
                {slot}
              </span>
            )}
            <span className="rounded-full border border-temple-gold/30 bg-temple-gold/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-temple-gold-soft uppercase backdrop-blur-sm">
              {t(`standing.${standing}`)}
            </span>
          </div>

          <p className="inline-flex flex-wrap items-center justify-center gap-2 text-base text-temple-paper/85">
            <CalendarDays className="h-4 w-4 text-temple-gold" />
            {formatEventDate(event.scheduledDate, locale)}
            <span className="text-temple-paper/40">·</span>
            {formatTimeRange(event.startTime, event.endTime, locale)}
          </p>

          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full border border-temple-gold/40 px-5 py-2.5 text-sm font-semibold text-temple-paper transition-all duration-300 hover:border-temple-gold hover:bg-temple-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-temple-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToEvents')}
          </Link>
        </div>
      </PageHero>

      <PageContainer className="bg-temple-paper !py-12 md:!py-16">
        <div
          className={cn(
            'grid grid-cols-1 gap-4 sm:grid-cols-2',
            facts.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
          )}
        >
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-2xl border border-temple-sand bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            >
              <fact.icon className="h-5 w-5 text-temple-gold" />
              <p className="mt-3 text-[11px] font-semibold tracking-[0.12em] text-temple-soft uppercase">
                {fact.label}
              </p>
              <p className="font-heading mt-1 text-lg font-semibold text-temple-ink">
                {fact.value}
              </p>
              {fact.hint && (
                <p className="mt-0.5 text-xs text-temple-soft">{fact.hint}</p>
              )}
            </div>
          ))}
        </div>

        {sponsor && (
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-temple-gold/35 bg-gradient-to-r from-temple-sand to-white px-6 py-5">
            <HeartHandshake className="h-6 w-6 shrink-0 text-temple-gold" />
            <div>
              <p className="text-[11px] font-semibold tracking-[0.12em] text-temple-soft uppercase">
                {t('sponsoredBy')}
              </p>
              <p className="font-heading mt-0.5 text-xl font-semibold text-temple-gold-ink">
                {sponsor}
              </p>
            </div>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-temple-sand bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] md:p-10">
          <h2 className="font-heading text-2xl font-semibold text-temple-ink md:text-3xl">
            {t('about')}
          </h2>

          <div className="mt-4 mb-6 flex items-center gap-2">
            <span className="h-[2px] w-8 bg-temple-gold" />
            <span className="h-1.5 w-1.5 rounded-full bg-temple-gold" />
          </div>

          {event.notes ? (
            <p className="text-base leading-relaxed whitespace-pre-line text-temple-soft md:text-lg">
              {event.notes}
            </p>
          ) : (
            <p className="text-base leading-relaxed text-temple-soft italic">
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

      {alsoUpcoming.length > 0 && (
        <PageContainer className="bg-white !pt-0">
          <h2 className="font-heading mb-8 text-center text-2xl font-semibold text-temple-ink md:text-3xl">
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
              className="inline-flex items-center gap-2 rounded-full border-2 border-temple-gold px-8 py-3.5 text-sm font-semibold text-temple-gold-ink transition-all duration-300 hover:bg-temple-gold hover:text-white"
            >
              {t('viewCalendar')}
            </Link>
          </div>
        </PageContainer>
      )}
    </>
  );
}
