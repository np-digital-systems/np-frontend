import {
  addMonths,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  format,
  parseISO,
  startOfMonth,
} from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

export const TIME_ZONE = 'Asia/Colombo';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    // "Rs" rather than "LKR", matching how the temple writes its books.
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompact(value: number): string {
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (Math.abs(value) >= 1000) return `₹${Math.round(value / 1000)}k`;

  return `₹${value}`;
}

export function formatSigned(value: number): string {
  if (value === 0) return formatCurrency(0);

  return value > 0
    ? `+${formatCurrency(value)}`
    : `−${formatCurrency(Math.abs(value))}`;
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export function isoParts(iso: string): {
  year: number;
  month: number;
  day: number;
} {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

export function getToday(now: Date = new Date()): string {
  return formatInTimeZone(now, TIME_ZONE, 'yyyy-MM-dd');
}

export function getActiveYear(today: string = getToday()): number {
  return Number(today.slice(0, 4));
}

export function formatLongDate(iso: string): string {
  return format(parseISO(iso), 'd MMMM yyyy');
}

export function formatShortDate(iso: string): string {
  return format(parseISO(iso), 'dd MMM');
}

export function formatWeekday(iso: string): string {
  return format(parseISO(iso), 'EEEE');
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function formatMonthLabel(key: string): string {
  return format(parseISO(`${key}-01`), 'MMMM yyyy');
}

export function monthName(month: number): string {
  return MONTH_NAMES[month - 1];
}

export function daysInMonth(year: number, month: number): number {
  return Number(format(new Date(year, month, 0), 'd'));
}

export function daysBetween(from: string, to: string): number {
  return differenceInCalendarDays(parseISO(to), parseISO(from));
}

export function yearsBetween(from: string, to: string): number {
  return daysBetween(from, to) / 365.25;
}

export function monthsBetween(from: string, to: string): number {
  return differenceInCalendarMonths(parseISO(to), parseISO(from));
}

export function addMonthsIso(iso: string, months: number): string {
  return format(addMonths(parseISO(iso), months), 'yyyy-MM-dd');
}

export function startOfMonthIso(iso: string): string {
  return format(startOfMonth(parseISO(iso)), 'yyyy-MM-dd');
}

export function formatStamp(stamp: string): string {
  const parsed = parseISO(stamp);

  return stamp.includes('T')
    ? format(parsed, 'd MMM yyyy, h:mm a')
    : format(parsed, 'd MMM yyyy');
}

export function timeAgo(stamp: string, now: string): string {
  const minutes = Math.max(
    Math.round(
      (parseISO(`${now}T23:59:59`).getTime() - parseISO(stamp).getTime()) /
        60_000,
    ),
    0,
  );

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;

  return `${Math.round(days / 30)}mo ago`;
}

export function zonedNow(now: Date = new Date()): Date {
  return toZonedTime(now, TIME_ZONE);
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  return format(new Date(2000, 0, 1, hours, minutes), 'h:mm a');
}

export function formatTimeRange(start: string, end: string | null): string {
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start);
}
