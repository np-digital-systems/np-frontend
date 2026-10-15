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
  name: string;
  /** Null for a typed name that isn't linked to a party. */
  partyId: number | null;
  parties: readonly PartyRef[];
  placeholder: string;
  onChange: (value: { name: string; partyId: number | null }) => void;
}

// Pick a party to link the entry, or keep a typed name for one-off donors. The name is
// always stored, so renaming a party later never rewrites a posted receipt.
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

  // Don't offer to keep a typed name that already matches a party.
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

  // Not modal: a modal popover inside a modal dialog fights over body pointer-events
  // and can leave the page unclickable. The dialog already traps focus.
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
          // Filtered manually so an unmatched name still leaves an option to keep it.
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
                        {party.roles
                          .map((role) => PARTY_KIND_LABELS[role])
                          .join(' · ')}
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
