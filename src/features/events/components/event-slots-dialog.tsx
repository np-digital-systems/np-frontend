'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Pencil, X } from 'lucide-react';

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
import { cn } from '@/lib/utils';

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

interface EventSlotsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventType: EventType | null;
  slots: readonly EventSlot[];
  canManage: boolean;
  onRename: (slotId: number, customInstanceName: string | null) => void;
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
  onRename,
}: EventSlotsDialogProps) {
  const tInstance = useTranslations('Events.instance');
  const [editing, setEditing] = useState<number | null>(null);
  const [value, setValue] = useState('');

  if (!eventType) return null;

  const monthly = isMonthly(eventType.frequencyType);

  function begin(slot: EventSlot) {
    setEditing(slot.id);
    setValue(slot.customInstanceName ?? '');
  }

  function commit(slotId: number) {
    onRename(slotId, value.trim() || null);
    setEditing(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{eventType.name}</DialogTitle>
          <DialogDescription>
            Name the {slots.length} instances of this pooja&rsquo;s year. A name set
            here is kept every year and shows wherever the instance appears.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {slots.map((slot) => {
            const name = slotLabel(
              {
                customInstanceName: slot.customInstanceName,
                instanceIdentifier: slot.instanceIdentifier,
                frequencyType: eventType.frequencyType,
              },
              tInstance,
            );

            return (
              <div
                key={slot.id}
                className="flex items-center gap-3 px-3.5 py-2.5"
              >
                <span className="ref w-10 shrink-0 text-xs text-text-muted tabular">
                  {slot.instanceIdentifier}
                </span>

                {editing === slot.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    {/*
                      * A monthly slot is named by its Tamil month, chosen from
                      * the twelve so one month cannot end up spelled three
                      * ways. Everything else takes the temple's own words.
                      */}
                    {monthly ? (
                      <EntityCombobox
                        className="w-full"
                        value={value || null}
                        options={monthOptions(value)}
                        noneLabel="Not named"
                        searchPlaceholder="Search months, or type a name…"
                        emptyMessage="No month matches that."
                        createLabel={(typed) => `Name it “${typed}”`}
                        onCreate={(typed) => setValue(typed)}
                        onChange={(next) => setValue(next ?? '')}
                      />
                    ) : (
                      <Input
                        autoFocus
                        value={value}
                        placeholder="சப்பரம், தேர்…"
                        onChange={(changeEvent) => setValue(changeEvent.target.value)}
                        onKeyDown={(keyEvent) => {
                          if (keyEvent.key === 'Enter') commit(slot.id);
                          if (keyEvent.key === 'Escape') setEditing(null);
                        }}
                      />
                    )}

                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Save name"
                      onClick={() => commit(slot.id)}
                    >
                      <Check />
                    </Button>

                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Cancel"
                      onClick={() => setEditing(null)}
                    >
                      <X />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span
                      className={cn(
                        'flex-1 truncate text-[13px]',
                        slot.customInstanceName
                          ? 'text-text-primary'
                          : 'text-text-muted',
                      )}
                    >
                      {name}
                    </span>

                    {canManage && (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Rename instance ${slot.instanceIdentifier}`}
                        onClick={() => begin(slot)}
                      >
                        <Pencil />
                      </Button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
