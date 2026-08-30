import type { Locale } from '@/i18n/routing';

import type { PublicEvent } from '../types';

/**
 * Turning an occurrence into words, in the visitor's language.
 *
 * Everything here is deterministic and timezone-free on purpose. Dates are
 * built at UTC midnight and formatted with `timeZone: 'UTC'`, so the server
 * render and the browser render agree — otherwise a calendar rendered in
 * Colombo and rehydrated in a browser set to another zone would mismatch and
 * React would throw the markup away.
 *
 * The API sends both names and the raw frequency rather than a rendered
 * English label, which is what lets "Week 24" become "வாரம் 24" here rather
 * than arriving already in the wrong language.
 */

const INTL_TAG: Record<Locale, string> = {
  en: 'en-GB',
  ta: 'ta-LK',
};

/** A Sunday, so a week walked forward from it yields weekday names in order. */
const KNOWN_SUNDAY = Date.UTC(2024, 0, 7);

function tag(locale: Locale): string {
  return INTL_TAG[locale] ?? INTL_TAG.ta;
}

function dateFromIso(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function dateFromTime(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);

  return new Date(Date.UTC(1970, 0, 1, hours, minutes));
}

/** The event type's name, in the language the visitor is reading. */
export function eventName(event: PublicEvent, locale: Locale): string {
  return locale === 'en' ? event.nameEn || event.nameTa : event.nameTa;
}

/**
 * Which slot of the year this is — "Week 24", "Valarpirai", "Day 3".
 *
 * Null when the slot has nothing to say. A `monthly_once` or `annual` type has
 * exactly one instance, so a label for it would only ever read "Monthly
 * observance" beside a name that already says as much — a badge that repeats
 * the title is worse than no badge. Everything else distinguishes one
 * occurrence of the type from another and earns its place.
 *
 * The temple's own name for a day always wins: it is written by hand and is
 * more meaningful than anything derived.
 */
export function instanceLabel(
  event: Pick<
    PublicEvent,
    'frequencyType' | 'instanceIdentifier' | 'customInstanceName'
  >,
  translate: (key: string, values?: Record<string, string | number>) => string,
): string | null {
  if (event.customInstanceName) return event.customInstanceName;

  const number = event.instanceIdentifier;

  switch (event.frequencyType) {
    case 'weekly':
      return translate('week', { number });
    case 'monthly_twice':
      return number === 1
        ? translate('valarpirai')
        : number === 2
          ? translate('theipirai')
          : translate('occurrence', { number });
    case 'multi_day':
      return translate('day', { number });
    case 'monthly_once':
    case 'annual':
      return null;
    default:
      return translate('occurrence', { number });
  }
}

/** The sponsor's name in the visitor's language, or null when nobody sponsors it. */
export function sponsorName(event: PublicEvent, locale: Locale): string | null {
  return locale === 'en'
    ? (event.sponsorNameEn ?? event.sponsorNameTa)
    : (event.sponsorNameTa ?? event.sponsorNameEn);
}

export function formatEventDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dateFromIso(iso));
}

export function formatShortDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dateFromIso(iso));
}

export function formatWeekday(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(dateFromIso(iso));
}

/** The day and month alone, for the date medallion on a card. */
export function dateParts(
  iso: string,
  locale: Locale,
): { day: string; month: string } {
  const date = dateFromIso(iso);

  return {
    day: new Intl.DateTimeFormat(tag(locale), {
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date),
    month: new Intl.DateTimeFormat(tag(locale), {
      month: 'short',
      timeZone: 'UTC',
    }).format(date),
  };
}

/**
 * The part of the day a Tamil reader expects before the clock.
 *
 * Intl renders `ta` as a bare "6:30 PM" — Latin day-periods bolted onto Tamil,
 * which reads as translated English. The temple writes its own notices as
 * "மாலை 6:30 மணி", so the day-period is chosen here and the clock is built
 * from it. Each entry covers the hours below `until`.
 */
const TAMIL_DAY_PERIODS: readonly { readonly until: number; readonly word: string }[] = [
  { until: 3, word: 'இரவு' },
  { until: 6, word: 'அதிகாலை' },
  { until: 12, word: 'காலை' },
  { until: 15, word: 'மதியம்' },
  { until: 21, word: 'மாலை' },
  { until: 24, word: 'இரவு' },
];

/** Trails a Tamil time, as in "மாலை 6:30 மணி" — "o'clock", roughly. */
const TAMIL_OCLOCK = 'மணி';

function tamilTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period =
    TAMIL_DAY_PERIODS.find((entry) => hours < entry.until) ??
    TAMIL_DAY_PERIODS[TAMIL_DAY_PERIODS.length - 1];
  const clock = hours % 12 === 0 ? 12 : hours % 12;

  return `${period.word} ${clock}:${String(minutes).padStart(2, '0')}`;
}

/** A time on its own — without the trailing "மணי", which belongs to the phrase. */
export function formatEventTime(time: string, locale: Locale): string {
  if (locale === 'ta') return tamilTime(time);

  // en-GB gives the day-first dates this site wants but lowercases the meridiem;
  // the rest of the English copy writes "6:00 PM".
  return new Intl.DateTimeFormat(tag(locale), {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  })
    .format(dateFromTime(time))
    .replace(/\b(am|pm)\b/g, (meridiem) => meridiem.toUpperCase());
}

export function formatTimeRange(
  start: string,
  end: string | null,
  locale: Locale,
): string {
  const from = formatEventTime(start, locale);
  const phrase = end ? `${from} – ${formatEventTime(end, locale)}` : from;

  return locale === 'ta' ? `${phrase} ${TAMIL_OCLOCK}` : phrase;
}

export function formatMonthTitle(
  year: number,
  month: number,
  locale: Locale,
): string {
  return new Intl.DateTimeFormat(tag(locale), {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function weekdayInitials(locale: Locale): readonly string[] {
  const format = new Intl.DateTimeFormat(tag(locale), {
    weekday: 'short',
    timeZone: 'UTC',
  });

  return Array.from({ length: 7 }, (_, index) =>
    format.format(new Date(KNOWN_SUNDAY + index * 86_400_000)),
  );
}

/**
 * A stock photograph for an occurrence.
 *
 * The calendar carries no images, and a card without one looks broken next to
 * the rest of the site. Picking by event type rather than at random keeps a
 * given pooja looking the same on the card, the calendar and its own page.
 */
const EVENT_IMAGES = [
  '/images/ceremony-puja.png',
  '/images/festival-navaratri.png',
  '/images/deity-shrine.png',
  '/images/temple-lamps.png',
  '/images/temple-rangoli.png',
] as const;

export function eventImage(eventTypeId: number): string {
  return EVENT_IMAGES[eventTypeId % EVENT_IMAGES.length];
}
