'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { FormField } from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/format';

import { loadHeadUsage } from '../lib/costing-actions';
import type { EventTypeRecord } from '../types';
import type { HeadUsage } from '../types/costing';

interface AccountOption {
  readonly id: number;
  readonly code: string;
  readonly name: string;
}

const EVERY_POOJA = '__all__';

interface RepriceHeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseAccounts: readonly AccountOption[];
  eventTypes: readonly EventTypeRecord[];
  onSubmit: (accountId: number, changes: { costingId: number; amount: number }[]) => void;
}

/**
 * Reprice one head everywhere it is paid.
 *
 * A rate the temple sets — the saathupadi's salary, the melam's fee — is one
 * decision that lands on every costing that pays it. Opening each of those in
 * turn, scrolling to the same line and typing the same figure is not a workflow;
 * it is the same answer given eight times. So the head is chosen once, every
 * costing paying it is listed with what it pays today, and one box sets them
 * all where they should all be the same.
 */
export function RepriceHeadDialog({
  open,
  onOpenChange,
  expenseAccounts,
  eventTypes,
  onSubmit,
}: RepriceHeadDialogProps) {
  const [accountId, setAccountId] = useState(0);
  const [eventTypeId, setEventTypeId] = useState<number | null>(null);
  const [usage, setUsage] = useState<readonly HeadUsage[] | null>(null);
  const [amounts, setAmounts] = useState<Record<number, number>>({});
  const [setAll, setSetAll] = useState('');
  const [loading, setLoading] = useState(false);

  const [wasOpen, setWasOpen] = useState(open);

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setAccountId(0);
      setEventTypeId(null);
      setUsage(null);
      setAmounts({});
      setSetAll('');
    }
  }

  async function look(nextAccountId: number, nextEventTypeId: number | null) {
    setAccountId(nextAccountId);
    setEventTypeId(nextEventTypeId);
    setUsage(null);
    setSetAll('');

    if (!nextAccountId) return;

    setLoading(true);

    const found = await loadHeadUsage(nextAccountId, nextEventTypeId ?? undefined).catch(
      () => [] as readonly HeadUsage[],
    );

    setUsage(found);
    setAmounts(Object.fromEntries(found.map((row) => [row.costingId, row.amount])));
    setLoading(false);
  }

  /** Only the ones the temple actually moved, so a no-op writes nothing. */
  const changes = (usage ?? [])
    .filter((row) => !row.isItemised && amounts[row.costingId] !== row.amount)
    .map((row) => ({ costingId: row.costingId, amount: amounts[row.costingId] }))
    .filter((change) => change.amount > 0);

  const repriceable = (usage ?? []).filter((row) => !row.isItemised);

  function applyToAll(value: string) {
    setSetAll(value);

    const amount = Number(value);

    if (!amount || amount <= 0) return;

    setAmounts((current) => {
      const next = { ...current };

      for (const row of repriceable) next[row.costingId] = amount;

      return next;
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Change a rate everywhere</DialogTitle>
          <DialogDescription>
            Pick what the temple pays for, and change it on every costing that
            pays it — without opening each one.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="reprice-head" label="What is paid for" required>
              <Select
                value={accountId ? String(accountId) : undefined}
                onValueChange={(value) => void look(Number(value), eventTypeId)}
              >
                <SelectTrigger id="reprice-head" className="w-full">
                  <SelectValue placeholder="Choose an expense head" />
                </SelectTrigger>

                <SelectContent>
                  {expenseAccounts.map((account) => (
                    <SelectItem key={account.id} value={String(account.id)}>
                      {account.code} · {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="reprice-type" label="For which pooja">
              <Select
                value={eventTypeId === null ? EVERY_POOJA : String(eventTypeId)}
                onValueChange={(value) =>
                  void look(accountId, value === EVERY_POOJA ? null : Number(value))
                }
              >
                <SelectTrigger id="reprice-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={EVERY_POOJA}>Every pooja</SelectItem>

                  {eventTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {loading && (
            <p className="flex items-center gap-2 py-6 text-sm text-text-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Looking for costings that pay it…
            </p>
          )}

          {usage !== null && !loading && usage.length === 0 && (
            <p className="rounded-lg bg-surface-2 px-3.5 py-6 text-center text-sm text-text-muted">
              No costing in force pays on that head yet.
            </p>
          )}

          {repriceable.length > 1 && (
            <FormField
              id="reprice-all"
              label="Set them all to"
              hint="Or change them one by one below."
            >
              <Input
                id="reprice-all"
                type="number"
                min={0}
                step="0.01"
                className="max-w-40"
                value={setAll}
                onChange={(changeEvent) => applyToAll(changeEvent.target.value)}
              />
            </FormField>
          )}

          {usage !== null && usage.length > 0 && (
            <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
              {usage.map((row) => (
                <div
                  key={row.costingId}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text-primary">
                      {row.eventTypeName}
                      {row.slotLabel ? ` — ${row.slotLabel}` : ''}
                    </p>

                    <p className="text-xs text-text-muted">
                      {row.scope}
                      {row.partyName ? ` · ${row.partyName}` : ''}
                      {amounts[row.costingId] !== row.amount &&
                        ` · was ${formatCurrency(row.amount)}`}
                    </p>
                  </div>

                  {/*
                    * An itemised head is decided by its items, so it is shown
                    * and not offered: changing the total here would leave it
                    * disagreeing with the coconuts underneath it.
                    */}
                  {row.isItemised ? (
                    <span className="text-xs text-text-muted">
                      itemised · open it to change
                    </span>
                  ) : (
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      aria-label={`Amount for ${row.eventTypeName}`}
                      className="w-32 text-right"
                      value={amounts[row.costingId] || ''}
                      onChange={(changeEvent) =>
                        setAmounts((current) => ({
                          ...current,
                          [row.costingId]: Number(changeEvent.target.value) || 0,
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            type="button"
            disabled={changes.length === 0}
            onClick={() => onSubmit(accountId, changes)}
          >
            {changes.length === 0
              ? 'Nothing changed'
              : `Save ${changes.length} costing${changes.length === 1 ? '' : 's'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
