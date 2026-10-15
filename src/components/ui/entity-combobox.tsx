'use client';

import * as React from 'react';
import { ChevronDownIcon, PlusIcon } from 'lucide-react';

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

export interface EntityOption {
  value: string;
  label: string;
  /** Also searchable. */
  description?: string;
  badge?: string;
  /** Hidden search terms. */
  keywords?: string;
}

export interface EntityGroup {
  heading?: string;
  options: readonly EntityOption[];
}

interface EntityComboboxProps {
  id?: string;
  value: string | null;
  options?: readonly EntityOption[];
  /** Order is preserved. Ignored when `options` is given. */
  groups?: readonly EntityGroup[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  noneLabel?: string;
  /** With `onCreate`, offers to create a record from an unmatched name. */
  createLabel?: (typed: string) => string;
  onCreate?: (typed: string) => void;
  onChange: (value: string | null) => void;
}

const NONE = '__none__';
const CREATE = '__create__';

export function EntityCombobox({
  id,
  value,
  options,
  groups,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'Nothing matches that search.',
  disabled,
  className,
  noneLabel,
  createLabel,
  onCreate,
  onChange,
}: EntityComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const typed = search.trim();

  const allGroups = React.useMemo<readonly EntityGroup[]>(
    () => groups ?? [{ options: options ?? [] }],
    [groups, options],
  );

  const flat = React.useMemo(
    () => allGroups.flatMap((group) => group.options),
    [allGroups],
  );

  const selected = flat.find((option) => option.value === value) ?? null;

  // Drop empty groups so headings never show alone.
  const matches = React.useMemo(() => {
    if (typed.length === 0) return allGroups;

    const needle = typed.toLowerCase();

    return allGroups
      .map((group) => ({
        ...group,
        options: group.options.filter((option) =>
          `${option.label} ${option.description ?? ''} ${option.keywords ?? ''}`
            .toLowerCase()
            .includes(needle),
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [allGroups, typed]);

  const matchCount = matches.reduce(
    (total, group) => total + group.options.length,
    0,
  );

  // Don't offer to create a name that already exists.
  const canCreate =
    typed.length > 0 &&
    Boolean(createLabel && onCreate) &&
    !flat.some((option) => option.label.toLowerCase() === typed.toLowerCase());

  function close() {
    setSearch('');
    setOpen(false);
  }

  function handleSelect(next: string) {
    if (next === CREATE) {
      onCreate?.(typed);
      close();
      return;
    }

    onChange(next === NONE ? null : next);
    close();
  }

  return (
    // `modal` keeps the list scrollable inside a dialog, whose scroll lock would block this portalled popover.
    <Popover
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : close())}
      modal
    >
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
        <span className={cn('line-clamp-1', !selected && 'text-muted-foreground')}>
          {selected ? selected.label : (noneLabel ?? placeholder)}
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
        {/* Filtered manually; cmdk's filter would also hide the create row. */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />

          <CommandList className="max-h-[clamp(12rem,var(--radix-popover-content-available-height,24rem),24rem)] overscroll-contain">
            {matchCount === 0 && !canCreate && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}

            {canCreate && (
              <>
                <CommandGroup>
                  <CommandItem value={CREATE} onSelect={handleSelect}>
                    <PlusIcon className="text-muted-foreground" />
                    <span className="truncate">{createLabel!(typed)}</span>
                  </CommandItem>
                </CommandGroup>

                {matchCount > 0 && <CommandSeparator />}
              </>
            )}

            {noneLabel && typed.length === 0 && (
              <CommandGroup>
                <CommandItem
                  value={NONE}
                  data-checked={value === null}
                  onSelect={handleSelect}
                >
                  <span className="text-muted-foreground">{noneLabel}</span>
                </CommandItem>
              </CommandGroup>
            )}

            {matches.map((group, index) => (
              <React.Fragment key={group.heading ?? `group-${index}`}>
                {index > 0 && <CommandSeparator />}

                <CommandGroup heading={group.heading}>
                  {group.options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      data-checked={option.value === value}
                      onSelect={handleSelect}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{option.label}</span>

                        {option.description && (
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {option.description}
                          </span>
                        )}
                      </span>

                      {option.badge && (
                        <span className="shrink-0 text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
                          {option.badge}
                        </span>
                      )}
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
