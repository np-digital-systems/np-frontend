'use client';

import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { FREQUENCY_LABELS, FREQUENCY_TYPES } from '../lib/event-data';
import type { EventType, FrequencyType } from '../types';

export type EventStatusFilter =
  | 'all'
  | 'upcoming'
  | 'completed'
  | 'overdue'
  | 'unsponsored';

export interface EventFilters {
  readonly query: string;
  readonly eventTypeId: number | 'all';
  readonly frequency: FrequencyType | 'all';
  readonly status: EventStatusFilter;
}

export const EMPTY_FILTERS: EventFilters = {
  query: '',
  eventTypeId: 'all',
  frequency: 'all',
  status: 'all',
};

const STATUS_OPTIONS: readonly { value: EventStatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Needs closing' },
  { value: 'unsponsored', label: 'Unsponsored' },
];

export function hasActiveFilters(filters: EventFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.eventTypeId !== 'all' ||
    filters.frequency !== 'all' ||
    filters.status !== 'all'
  );
}

interface EventsToolbarProps {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
  eventTypes: readonly EventType[];
  /** Rendered at the end of the row — usually the list/month view switch. */
  trailing?: React.ReactNode;
}

/**
 * Filter row for the calendar.
 *
 * State is owned by the screen and passed down, so the same controls drive
 * both the list and the month grid instead of each view keeping its own
 * idea of what is being filtered.
 */
export function EventsToolbar({
  filters,
  onChange,
  eventTypes,
  trailing,
}: EventsToolbarProps) {
  function set<K extends keyof EventFilters>(
    key: K,
    value: EventFilters[K],
  ) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-64">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>

          <InputGroupInput
            type="search"
            value={filters.query}
            placeholder="Search events, sponsors, notes…"
            aria-label="Search events"
            onChange={(changeEvent) => set('query', changeEvent.target.value)}
          />
        </InputGroup>

        <Select
          value={
            filters.eventTypeId === 'all' ? 'all' : String(filters.eventTypeId)
          }
          onValueChange={(value) =>
            set('eventTypeId', value === 'all' ? 'all' : Number(value))
          }
        >
          <SelectTrigger aria-label="Filter by event type">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All event types</SelectItem>

            {eventTypes.map((type) => (
              <SelectItem key={type.id} value={String(type.id)}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.frequency}
          onValueChange={(value) =>
            set('frequency', value as FrequencyType | 'all')
          }
        >
          <SelectTrigger aria-label="Filter by frequency">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All frequencies</SelectItem>

            {FREQUENCY_TYPES.map((frequency) => (
              <SelectItem key={frequency} value={frequency}>
                {FREQUENCY_LABELS[frequency]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => set('status', value as EventStatusFilter)}
        >
          <SelectTrigger aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters(filters) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(EMPTY_FILTERS)}
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}
