'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { PARTY_KIND_LABELS } from '../lib/accounting-data';
import type { PartyRef } from '../types';

interface PartyPickerProps {
  id: string;
  /** The name as it will be written on the voucher. */
  name: string;
  /** The record it is linked to, where the name matched one. */
  partyId: number | null;
  parties: readonly PartyRef[];
  placeholder: string;
  onChange: (value: { name: string; partyId: number | null }) => void;
}

/**
 * Who a voucher is with, as one control instead of two.
 *
 * A name and a link to a record are one answer, not two questions, so this
 * asks once. Type a name: matching sponsors, staff and vendors appear, and
 * choosing one links the entry so the books can group by it. Type a name that
 * matches nobody and it is kept as written — the hundial draws walk-in donors
 * all day and none of them need a record.
 *
 * The typed name is always stored either way. A party later renamed cannot
 * rewrite what a posted receipt said it was.
 */
export function PartyPicker({
  id,
  name,
  partyId,
  parties,
  placeholder,
  onChange,
}: PartyPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const linked = parties.find((party) => party.id === partyId);
  const typed = search.trim();

  // Offering to keep a name that already names a party would be two ways to
  // say the same thing, and the linked one is better.
  const canKeepTyped =
    typed.length > 0 &&
    !parties.some((party) => party.name.toLowerCase() === typed.toLowerCase());

  function choose(party: PartyRef) {
    onChange({ name: party.name, partyId: party.id });
    setSearch('');
    setOpen(false);
  }

  function keepAsTyped() {
    onChange({ name: typed, partyId: null });
    setSearch('');
    setOpen(false);
  }

  /*
   * Deliberately not `modal`. A modal popover nested inside a modal dialog has
   * both of them setting `pointer-events: none` on the body and fighting over
   * restoring it, and the loser leaves the whole page unclickable. The dialog
   * already traps and restores focus for everything inside it; the guard in
   * DialogContent is what keeps a click in here from closing the dialog.
   */
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span
            className={cn(
              'truncate',
              name ? 'text-text-primary' : 'text-text-muted',
            )}
          >
            {name || placeholder}
          </span>

          <span className="flex items-center gap-1.5">
            {/*
              * Says at a glance whether this entry can be grouped by person.
              * A name alone still posts; it just answers no such question.
              */}
            {name && !linked && (
              <span className="text-[10px] tracking-[0.06em] text-text-muted uppercase">
                not on record
              </span>
            )}
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command
          // Filtering is done here rather than by the list, so a name that
          // matches nobody still leaves something to click.
          shouldFilter={false}
        >
          <CommandInput
            placeholder="Search or type a name"
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {!canKeepTyped && <CommandEmpty>No one by that name.</CommandEmpty>}

            {canKeepTyped && (
              <CommandGroup>
                <CommandItem value={`keep-${typed}`} onSelect={keepAsTyped}>
                  <UserPlus className="text-text-muted" />
                  <span className="truncate">
                    Use “{typed}” — not on record
                  </span>
                </CommandItem>
              </CommandGroup>
            )}

            <CommandGroup>
              {parties
                .filter((party) =>
                  typed.length === 0
                    ? true
                    : `${party.name} ${party.nameEn}`
                        .toLowerCase()
                        .includes(typed.toLowerCase()),
                )
                .slice(0, 50)
                .map((party) => (
                  <CommandItem
                    key={party.id}
                    value={String(party.id)}
                    onSelect={() => choose(party)}
                  >
                    <span className="truncate">{party.name}</span>

                    <span className="ml-auto flex items-center gap-2">
                      <span className="text-[10px] tracking-[0.06em] text-text-muted uppercase">
                        {PARTY_KIND_LABELS[party.kind]}
                      </span>

                      <Check
                        className={cn(
                          'size-4',
                          party.id === partyId ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
