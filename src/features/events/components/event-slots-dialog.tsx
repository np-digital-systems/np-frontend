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
 * The slots of one pooja type — the structure of its year.
 *
 * The only screen where a slot can be named before anything happens to it. A
 * name set here shows wherever that slot appears afterwards: on the calendar,
 * on the yearly schedule, and on the pooja picker of a receipt. Nothing else
 * names a slot, so there is only ever one answer to what it is called.
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
            The {slots.length} slots of this pooja&rsquo;s year. Each is named once
            and keeps that name every year; dates and sponsors are set against
            them separately.
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

                    <span className="shrink-0 text-xs text-text-muted">
                      {slot.sponsorNames.length > 0
                        ? slot.sponsorNames.join(', ')
                        : 'no sponsors'}
                    </span>

                    {slot.scheduledCount > 0 && (
                      <span className="shrink-0 text-[11px] text-success">
                        scheduled
                      </span>
                    )}

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
