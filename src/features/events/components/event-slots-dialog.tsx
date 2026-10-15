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

// Includes the current value so a custom name still shows in the trigger.
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

  // Reset names when the pooja or saved slots change (state adjusted during render, not in an effect).
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

  // Only changed rows are sent; a cleared row removes the name.
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
            Name the {slots.length} instances of this pooja.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          {slots.map((slot) => {
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

                {/* Monthly slots pick from the Tamil months so spellings stay consistent. */}
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
