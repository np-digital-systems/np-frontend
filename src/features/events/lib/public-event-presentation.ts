import type { Locale } from '@/i18n/routing';

import type { FrequencyType, PublicEvent } from '../types';

// Dates are built at UTC midnight and formatted with timeZone 'UTC' so server and
// browser renders match regardless of the visitor's timezone (avoids hydration mismatch).

const INTL_TAG: Record<Locale, string> = {
  en: 'en-GB',
  ta: 'ta-LK',
};

// A Sunday, so walking forward a week yields weekday names in order.
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

export function eventName(event: PublicEvent, locale: Locale): string {
  return locale === 'en' ? event.nameEn || event.nameTa : event.nameTa;
}

// Null for monthly_once and annual: they have one instance, so a label would only repeat the name.
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

// Intl renders Tamil times with Latin AM/PM; the temple writes "மாலை 6:30 மணி".
// Each entry covers the hours below `until`.
const TAMIL_DAY_PERIODS: readonly { readonly until: number; readonly word: string }[] = [
  { until: 3, word: 'இரவு' },
  { until: 6, word: 'அதிகாலை' },
  { until: 12, word: 'காலை' },
  { until: 15, word: 'மதியம்' },
  { until: 21, word: 'மாலை' },
  { until: 24, word: 'இரவு' },
];

const TAMIL_OCLOCK = 'மணி';

function tamilTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period =
    TAMIL_DAY_PERIODS.find((entry) => hours < entry.until) ??
    TAMIL_DAY_PERIODS[TAMIL_DAY_PERIODS.length - 1];
  const clock = hours % 12 === 0 ? 12 : hours % 12;

  return `${period.word} ${clock}:${String(minutes).padStart(2, '0')}`;
}

export function formatEventTime(time: string, locale: Locale): string {
  if (locale === 'ta') return tamilTime(time);

  // en-GB lowercases am/pm; the site writes "6:00 PM".
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

// Picked by event type so a pooja shows the same image on every page.
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

export function slotLabel(
  slot: {
    customInstanceName?: string | null;
    instanceIdentifier: number | null;
    frequencyType: FrequencyType;
  },
  translate: (key: string, values?: Record<string, string | number>) => string,
): string {
  if (slot.customInstanceName) return slot.customInstanceName;

  const number = slot.instanceIdentifier;

  // A sponsor registered against the type but not yet assigned an occurrence.
  if (number === null) return translate('unassigned');

  switch (slot.frequencyType) {
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
      return translate('monthly', { number });
    case 'annual':
      return translate('annual');
    default:
      return translate('occurrence', { number });
  }
}
