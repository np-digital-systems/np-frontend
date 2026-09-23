'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EntityCombobox, type EntityOption } from '@/components/ui/entity-combobox';

import { TAMIL_MONTHS, isMonthly } from '../lib/event-data';
import { slotLabel } from '../lib/public-event-presentation';
import type { EventSlot, EventType } from '../types';

/**
 * The twelve months, plus whatever this slot is already called.
 *
 * The list is the usual answer, not the only one — a month can fall to a name
 * the calendar has no word for. Carrying the current value as an option is
 * what lets a custom name show in the trigger rather than reading as unnamed
 * the moment the picker is reopened on it.
 */
function monthOptions(current: string): readonly EntityOption[] {
  const months = TAMIL_MONTHS.map((month) => ({ value: month, label: month }));

  return current && !TAMIL_MONTHS.includes(current)
    ? [{ value: current, label: current }, ...months]
    : months;
}

export interface SlotRename {
  slotId: number;
  customInstanceName: string | null;
}

interface EventSlotsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventType: EventType | null;
  slots: readonly EventSlot[];
  canManage: boolean;
  pending: boolean;
  onSave: (changes: readonly SlotRename[]) => void;
}

/**
 * Naming the instances of one pooja type.
 *
 * The only screen where an instance can be named before anything happens to
 * it. A name set here shows wherever that instance appears afterwards: on the
 * calendar, on the yearly schedule, and on the pooja picker of a receipt.
 * Nothing else names one, so there is only ever one answer to what it is
 * called.
 *
 * Every row is open at once, and the whole lot saves together. Naming a year
 * is one sitting — thirteen instances of a festival get their names in one go,
 * from a list somebody is reading down — and a pencil that had to be clicked,
 * typed into and ticked for each of them made an afternoon's work out of it.
 *
 * Names and nothing else. Who sponsors an instance is answered on the
 * sponsorships page and how many times it is dated on the calendar, and both
 * were shown here too — a third copy that could only ever fall out of step
 * with the other two.
 */
export function EventSlotsDialog({
  open,
  onOpenChange,
  eventType,
  slots,
  canManage,
  pending,
  onSave,
}: EventSlotsDialogProps) {
  const tInstance = useTranslations('Events.instance');

  /*
   * Re-seeded when the dialog is opened on a different pooja, or when the
   * slots come back from a save. Adjusting state during render rather than in
   * an effect keeps it to a single pass.
   */
  const seed = `${eventType?.id ?? 'none'}|${slots.map((slot) => `${slot.id}:${slot.customInstanceName ?? ''}`).join(',')}`;
  const [lastSeed, setLastSeed] = useState(seed);
  const [names, setNames] = useState<Record<number, string>>(() =>
    Object.fromEntries(slots.map((slot) => [slot.id, slot.customInstanceName ?? ''])),
  );

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setNames(
      Object.fromEntries(slots.map((slot) => [slot.id, slot.customInstanceName ?? ''])),
    );
  }

  /*
   * Only what actually changed is sent. Opening the dialog and pressing Save
   * without touching anything should write nothing at all, and a row cleared
   * back to empty is a name removed rather than a name of "".
   */
  const changes = useMemo<SlotRename[]>(
    () =>
      slots
        .filter((slot) => (names[slot.id] ?? '').trim() !== (slot.customInstanceName ?? ''))
        .map((slot) => ({
          slotId: slot.id,
          customInstanceName: (names[slot.id] ?? '').trim() || null,
        })),
    [slots, names],
  );

  if (!eventType) return null;

  const monthly = isMonthly(eventType.frequencyType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{eventType.name}</DialogTitle>
          <DialogDescription>
            Name the {slots.length} instances of this pooja&rsquo;s year. A name set
            here is kept every year and shows wherever the instance appears.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          {slots.map((slot) => {
            /*
             * The fallback, as a placeholder rather than as a value. A row
             * showing "ஆண்டுதோறும்" in the same weight as a real name made
             * eleven unnamed instances read as eleven identically named ones.
             */
            const fallback = slotLabel(
              {
                customInstanceName: null,
                instanceIdentifier: slot.instanceIdentifier,
                frequencyType: eventType.frequencyType,
              },
              tInstance,
            );

            const value = names[slot.id] ?? '';

            return (
              <div key={slot.id} className="flex items-center gap-3">
                <span className="w-7 shrink-0 text-right text-xs text-text-muted tabular">
                  {slot.instanceIdentifier}
                </span>

                {/*
                  * A monthly slot is named by its Tamil month, chosen from the
                  * twelve so one month cannot end up spelled three ways.
                  * Everything else takes the temple's own words.
                  */}
                {monthly ? (
                  <EntityCombobox
                    className="w-full"
                    value={value || null}
                    options={monthOptions(value)}
                    noneLabel={fallback}
                    disabled={!canManage}
                    searchPlaceholder="Search months, or type a name…"
                    emptyMessage="No month matches that."
                    createLabel={(typed) => `Name it “${typed}”`}
                    onCreate={(typed) => setNames((current) => ({ ...current, [slot.id]: typed }))}
                    onChange={(next) =>
                      setNames((current) => ({ ...current, [slot.id]: next ?? '' }))
                    }
                  />
                ) : (
                  <Input
                    value={value}
                    placeholder={fallback}
                    disabled={!canManage}
                    aria-label={`Name for instance ${slot.instanceIdentifier}`}
                    onChange={(changeEvent) =>
                      setNames((current) => ({
                        ...current,
                        [slot.id]: changeEvent.target.value,
                      }))
                    }
                  />
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {canManage ? 'Cancel' : 'Close'}
          </Button>

          {canManage && (
            <Button
              disabled={pending || changes.length === 0}
              title={changes.length === 0 ? 'No names have changed' : undefined}
              onClick={() => onSave(changes)}
            >
              {changes.length > 0 ? `Save ${changes.length} name${changes.length === 1 ? '' : 's'}` : 'Save names'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
