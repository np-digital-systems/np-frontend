import Image from 'next/image';
import { ArrowRight, CalendarDays, Clock, HeartHandshake } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

import {
  dateParts,
  eventImage,
  eventName,
  formatEventDate,
  formatTimeRange,
  instanceLabel,
  sponsorName,
} from '../../lib/public-event-presentation';
import type { PublicEvent } from '../../types';

interface SiteEventCardProps {
  event: PublicEvent;
  className?: string;
}

/**
 * One occurrence, as a card on the public site.
 *
 * Shaped after the existing home-page card so the two read as one design, but
 * driven by the calendar rather than a hand-written constant: the date, the
 * name and the slot all come from the API, in whichever language is on screen.
 */
export function SiteEventCard({ event, className }: SiteEventCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations('Events.card');
  const tInstance = useTranslations('Events.instance');

  const title = eventName(event, locale);
  const slot = instanceLabel(event, tInstance);
  const sponsor = sponsorName(event, locale);
  const { day, month } = dateParts(event.scheduledDate, locale);

  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-500',
        'shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.15)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]',
        'hover:-translate-y-1',
        className,
      )}
    >
      <div className="relative h-52 overflow-hidden">
        <Image
          src={eventImage(event.eventTypeId)}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Date medallion — the one thing a visitor scans for. */}
        <div className="absolute top-4 left-4 flex h-16 w-16 flex-col items-center justify-center rounded-xl bg-white/95 shadow-[0_4px_16px_rgba(0,0,0,0.12)] backdrop-blur-sm">
          <span className="font-heading text-2xl leading-none font-bold text-[#8B0000]">
            {day}
          </span>
          <span className="mt-0.5 text-[10px] font-semibold tracking-wider text-[#735C00] uppercase">
            {month}
          </span>
        </div>

        {slot && (
          <span className="absolute top-4 right-4 rounded-full bg-[#D4AF37]/95 px-3 py-1 text-[11px] font-semibold tracking-wider text-white uppercase">
            {slot}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading mb-2 line-clamp-2 text-xl font-semibold text-[#1A1C1C]">
          {title}
        </h3>

        {event.notes ? (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#4D4635]">
            {event.notes}
          </p>
        ) : (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#7F7663] italic">
            {t('noDescription')}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-[#7F7663]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-[#D4AF37]" />
            {formatEventDate(event.scheduledDate, locale)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#D4AF37]" />
            {formatTimeRange(event.startTime, event.endTime, locale)}
          </span>
        </div>

        {sponsor && (
          <p className="mt-3 inline-flex items-start gap-1.5 border-t border-[#F0EAD8] pt-3 text-xs text-[#735C00]">
            <HeartHandshake className="mt-px h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
            <span>
              <span className="text-[#7F7663]">{t('sponsoredBy')} </span>
              <span className="font-semibold">{sponsor}</span>
            </span>
          </p>
        )}

        <span className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C430] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 group-hover:shadow-[0_4px_16px_rgba(212,175,55,0.3)]">
          {t('details')}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
