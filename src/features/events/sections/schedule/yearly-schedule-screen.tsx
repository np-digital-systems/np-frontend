'use client';

import { useServerAction } from '@/hooks/use-server-action';

import { createEvent, updateEvent } from '../../lib/event-actions';

import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';

import {
  ActionError,
  PortalPageHeader,
  ReadOnlyNotice,
  StatCard,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';

import {
  EventFormDialog,
  type EventDraft,
} from '../../components/event-form-dialog';
import { READ_ONLY_MESSAGE, type EventAccess } from '../../lib/event-access';
import type {
  EventRecord,
  EventType,
  ScheduleGroup,
  ScheduleSlot,
  SponsorAssignment,
  SponsorParty,
} from '../../types';

import { ScheduleGroupCard } from './schedule-group-card';

const DENSE_THRESHOLD = 12;

interface YearlyScheduleScreenProps {
  groups: readonly ScheduleGroup[];
  initialEvents: readonly EventRecord[];
  eventTypes: readonly EventType[];
  sponsors: readonly SponsorParty[];
  assignments: readonly SponsorAssignment[];
  access: EventAccess;
  today: string;
  year: number;
}

export function YearlyScheduleScreen({
  groups,
  initialEvents,
  eventTypes,
  sponsors,
  assignments,
  access,
  today,
  year,
}: YearlyScheduleScreenProps) {
  const events = initialEvents;
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventRecord | null>(null);
  const [prefill, setPrefill] = useState<EventRecord | null>(null);

    const resolved = useMemo(
    () =>
      groups.map((group) => {
        const typeEvents = events.filter(
          (event) => event.eventTypeId === group.eventType.id,
        );

        const isDense = group.eventType.noOfInstances > DENSE_THRESHOLD;

        const identifiers = isDense
          ? [
              ...new Set([
                ...group.slots.map((slot) => slot.instanceIdentifier),
                ...typeEvents.map((event) => event.instanceIdentifier),
              ]),
            ].sort((a, b) => a - b)
          : group.slots.map((slot) => slot.instanceIdentifier);

        const slots: ScheduleSlot[] = identifiers.map((instanceIdentifier) => {
          const base = group.slots.find(
            (slot) => slot.instanceIdentifier === instanceIdentifier,
          );

          // A slot can carry several dates in a year, so the earliest stands
          // for it and the rest are counted rather than dropped.
          const occurrences = typeEvents
            .filter(
              (candidate) =>
                candidate.instanceIdentifier === instanceIdentifier,
            )
            .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

          const event = occurrences[0] ?? null;

          return {
            instanceIdentifier,
            customInstanceName:
              event?.customInstanceName ?? base?.customInstanceName ?? null,
            instanceLabel:
              event?.instanceLabel ??
              base?.instanceLabel ??
              `#${instanceIdentifier}`,
            defaultSponsor: base?.defaultSponsor ?? null,
            sponsorCount: base?.sponsorCount ?? 0,
            eventCount: occurrences.length,
            event,
          };
        });

        return { eventType: group.eventType, slots, isDense };
      }),
    [groups, events],
  );

  const totals = useMemo(() => {
    const slots = resolved.flatMap((group) => group.slots);

    return {
      planned: resolved.reduce(
        (sum, group) => sum + group.eventType.noOfInstances,
        0,
      ),
      scheduled: events.length,
      open: slots.filter((slot) => slot.event === null).length,
      unsponsored: events.filter((event) => event.sponsorPartyId === null).length,
    };
  }, [resolved, events]);

    function handleSchedule(slot: ScheduleSlot, eventType: EventType) {
    if (slot.event) {
      setPrefill(null);
      setEditing(slot.event);
      setFormOpen(true);
      return;
    }

    setEditing(null);
    setPrefill({
      id: -1,
      eventTypeId: eventType.id,
      instanceIdentifier: slot.instanceIdentifier,
      customInstanceName: slot.customInstanceName,
      scheduledDate: '',
      startTime: '',
      endTime: null,
      sponsorPartyId: slot.defaultSponsor?.id ?? null,
      notes: null,
      isCompleted: false,
      createdAt: '',
      updatedAt: '',
      eventType,
      sponsor: slot.defaultSponsor,
      instanceLabel: slot.instanceLabel,
      status: 'Unassigned',
    });
    setFormOpen(true);
  }

  const { run, error: actionError } = useServerAction();

  function handleSubmit(draft: EventDraft) {
    const target = editing;

    run(
      () =>
        target
          ? updateEvent(target.id, {
              customInstanceName: draft.customInstanceName || null,
              scheduledDate: draft.scheduledDate,
              startTime: draft.startTime,
              endTime: draft.endTime || null,
              sponsorPartyId: draft.sponsorPartyId,
              notes: draft.notes || null,
            })
          : createEvent({
              eventTypeId: draft.eventTypeId,
              instanceIdentifier: draft.instanceIdentifier,
              customInstanceName: draft.customInstanceName || null,
              scheduledDate: draft.scheduledDate,
              startTime: draft.startTime,
              endTime: draft.endTime || null,
              sponsorPartyId: draft.sponsorPartyId,
              notes: draft.notes || null,
            }),
      () => {
        setEditing(null);
        setPrefill(null);
        setFormOpen(false);
      },
    );
  }

  return (
    <>
      <PortalPageHeader
        title="Yearly Schedule"
        description="Every instance each event type declares, and whether it has been given a date and a sponsor."
        meta={[
          <span key="year" className="tabular">
            Planning year {year}
          </span>,
          <span key="scheduled" className="tabular">
            {totals.scheduled} dated
          </span>,
          totals.open > 0 ? (
            <span key="open" className="text-warning tabular">
              {totals.open} slots open
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          access.canExport && (
            <Button variant="outline">
              <Download />
              Export Schedule
            </Button>
          )
        }
      />

      <ActionError message={actionError} />

      {!access.canWrite && (
        <ReadOnlyNotice
          message={`${READ_ONLY_MESSAGE} The schedule below is the temple's plan for ${year}.`}
        />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Declared Instances"
          value={String(totals.planned)}
          caption="Across all event types"
        />
        <StatCard
          label="Dated"
          value={String(totals.scheduled)}
          caption="On the calendar"
        />
        <StatCard
          label="Open Slots"
          value={String(totals.open)}
          caption="Still without a date"
        />
        <StatCard
          label="Unsponsored"
          value={String(totals.unsponsored)}
          caption="Dated but no sponsor"
        />
      </div>

      <div className="flex flex-col gap-4">
        {resolved.map((group) => (
          <ScheduleGroupCard
            key={group.eventType.id}
            eventType={group.eventType}
            slots={group.slots}
            isDense={group.isDense}
            access={access}
            today={today}
            defaultOpen={group.slots.length <= DENSE_THRESHOLD}
            onSchedule={handleSchedule}
          />
        ))}
      </div>

      {access.canWrite && (
        <EventFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          event={editing ?? prefill}
          mode={editing ? 'edit' : 'create'}
          eventTypes={eventTypes}
          sponsors={sponsors}
          assignments={assignments}
          canComplete={access.canComplete}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
