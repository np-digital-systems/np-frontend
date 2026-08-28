'use client';

import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
  value: string;
  /** Shown in the trigger and matched against what is typed. */
  label: string;
  /** Second line in the list; also searchable. */
  description?: string;
  /** Extra words to match on that are not worth showing. */
  keywords?: string;
}

export interface ComboboxGroup {
  /** Omit for an unlabelled group. */
  heading?: string;
  options: readonly ComboboxOption[];
}

interface ComboboxProps {
  id?: string;
  value: string | null;
  groups: readonly ComboboxGroup[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  onChange: (value: string) => void;
}

/**
 * A select you can type into.
 *
 * The lists it fronts — devotees, event types — outgrow a plain dropdown, so
 * the options are filtered as you type. Groups keep their given order, which
 * is how a caller puts the likely choices at the top.
 */
export function Combobox({
  id,
  value,
  groups,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'Nothing matches that search.',
  disabled,
  className,
  onChange,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(
    () =>
      groups
        .flatMap((group) => group.options)
        .find((option) => option.value === value) ?? null,
    [groups, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          'flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5',
          'text-left text-sm transition-colors outline-none select-none',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-input/30 dark:hover:bg-input/50',
          className,
        )}
      >
        <span
          className={cn(
            'line-clamp-1',
            !selected && 'text-muted-foreground',
          )}
        >
          {selected ? selected.label : placeholder}
        </span>

        <ChevronDownIcon
          className="pointer-events-none size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command
          filter={(itemValue, search, keywords) => {
            const haystack = [itemValue, ...(keywords ?? [])]
              .join(' ')
              .toLowerCase();

            return haystack.includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder} />

          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>

            {groups.map((group, index) => (
              <React.Fragment key={group.heading ?? `group-${index}`}>
                {index > 0 && <CommandSeparator />}

                <CommandGroup heading={group.heading}>
                  {group.options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      keywords={[
                        option.label,
                        option.description ?? '',
                        option.keywords ?? '',
                      ]}
                      data-checked={option.value === value}
                      onSelect={(next) => {
                        onChange(next);
                        setOpen(false);
                      }}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{option.label}</span>

                        {option.description && (
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {option.description}
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
