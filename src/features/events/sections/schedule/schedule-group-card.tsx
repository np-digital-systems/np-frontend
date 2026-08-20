'use client';

import { CalendarPlus, ChevronDown } from 'lucide-react';

import {
  Card,
  DataCell,
  DataRow,
  DataTable,
  StatusBadge,
  type DataColumn,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import { FrequencyBadge } from '../../components/frequency-badge';
import { SponsorCell } from '../../components/sponsor-cell';
import type { EventAccess } from '../../lib/event-access';
import {
  formatEventDate,
  formatTimeRange,
  isOverdue,
} from '../../lib/event-data';
import type { EventType, ScheduleSlot } from '../../types';

interface ScheduleGroupCardProps {
  eventType: EventType;
  slots: readonly ScheduleSlot[];
  /** True when only touched slots are listed — weekly types have 52. */
  isDense: boolean;
  access: EventAccess;
  today: string;
  defaultOpen: boolean;
  onSchedule: (slot: ScheduleSlot, eventType: EventType) => void;
}

/**
 * One event type's year.
 *
 * Collapsed by default for the long recurring types and open for the ones
 * with a handful of slots, so the page opens on the festivals an admin is
 * actually planning rather than on 52 Friday poojas.
 */
export function ScheduleGroupCard({
  eventType,
  slots,
  isDense,
  access,
  today,
  defaultOpen,
  onSchedule,
}: ScheduleGroupCardProps) {
  const scheduled = slots.filter((slot) => slot.event !== null).length;
  const unscheduled = slots.length - scheduled;

  const columns: DataColumn[] = [
    { key: 'instance', label: 'Instance' },
    { key: 'date', label: 'Scheduled Date' },
    { key: 'time', label: 'Time' },
    ...(access.canViewSponsors
      ? [{ key: 'sponsor', label: 'Sponsor' } as const]
      : []),
    { key: 'status', label: 'Status' },
    ...(access.canCreate || access.canUpdate
      ? [{ key: 'actions', label: 'Actions', align: 'right', srOnly: true } as const]
      : []),
  ];

  return (
    <Card>
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger
          className={cn(
            'group flex w-full items-center justify-between gap-4',
            'px-5 py-3.5 text-left',
            'transition-colors hover:bg-interactive-hover',
            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <ChevronDown
              className="size-4 shrink-0 text-text-muted transition-transform group-data-[state=closed]:-rotate-90"
              aria-hidden
            />

            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-text-primary">
                {eventType.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-text-muted">
                {eventType.nameEn}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <FrequencyBadge frequency={eventType.frequencyType} />

            <span className="hidden text-xs text-text-muted tabular sm:inline">
              {scheduled} of {eventType.noOfInstances} scheduled
            </span>

            {unscheduled > 0 && (
              <span className="rounded-full bg-warning-subtle px-1.5 py-0.5 text-[11px] font-medium text-warning tabular">
                {unscheduled} open
              </span>
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border">
            {isDense && (
              <p className="border-b border-border bg-surface-2 px-5 py-2 text-[11px] text-text-muted">
                Showing the {slots.length} of {eventType.noOfInstances}{' '}
                instances that are dated or hold a standing sponsor.
              </p>
            )}

            <DataTable
              columns={columns}
              minWidth={access.canViewSponsors ? 820 : 660}
            >
              {slots.map((slot) => {
                const { event } = slot;

                return (
                  <DataRow key={slot.instanceIdentifier}>
                    <DataCell>
                      <span className="text-[13px] font-medium text-text-primary">
                        {slot.instanceLabel}
                      </span>
                      <span className="ml-2 text-[11px] text-text-muted tabular">
                        #{slot.instanceIdentifier}
                      </span>
                    </DataCell>

                    <DataCell nowrap className="tabular">
                      {event ? (
                        formatEventDate(event.scheduledDate)
                      ) : (
                        <span className="text-text-disabled">Not scheduled</span>
                      )}
                    </DataCell>

                    <DataCell nowrap className="text-xs tabular">
                      {event ? (
                        formatTimeRange(event.startTime, event.endTime)
                      ) : (
                        <span className="text-text-disabled">—</span>
                      )}
                    </DataCell>

                    {access.canViewSponsors && (
                      <DataCell>
                        <SponsorCell
                          sponsor={event ? event.sponsor : slot.defaultSponsor}
                          showContact={false}
                        />

                        {!event && slot.defaultSponsor && (
                          <span className="mt-0.5 block text-[11px] text-text-muted">
                            Standing sponsor
                          </span>
                        )}
                      </DataCell>
                    )}

                    <DataCell nowrap>
                      {event ? (
                        <StatusBadge
                          status={
                            isOverdue(event, today)
                              ? 'Pending Approval'
                              : event.status
                          }
                        />
                      ) : (
                        <StatusBadge status="Unassigned" />
                      )}
                    </DataCell>

                    {(access.canCreate || access.canUpdate) && (
                      <DataCell align="right" nowrap>
                        {event ? (
                          access.canUpdate && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSchedule(slot, eventType)}
                            >
                              Edit
                            </Button>
                          )
                        ) : (
                          access.canCreate && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSchedule(slot, eventType)}
                            >
                              <CalendarPlus />
                              Schedule
                            </Button>
                          )
                        )}
                      </DataCell>
                    )}
                  </DataRow>
                );
              })}
            </DataTable>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
