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
  /** Shown in the trigger and matched against what is typed. */
  label: string;
  /** Second line in the list; also searchable. */
  description?: string;
  /** A short tag on the right — a party's roles, an account's code. */
  badge?: string;
  /** Extra words to match on that are not worth showing. */
  keywords?: string;
}

export interface EntityGroup {
  /** Omit for an unlabelled group. */
  heading?: string;
  options: readonly EntityOption[];
}

interface EntityComboboxProps {
  id?: string;
  value: string | null;
  /** One flat list. Use `groups` instead where the order carries meaning. */
  options?: readonly EntityOption[];
  /** Groups keep their given order, which is how a caller puts the likely
      choices at the top. Ignored when `options` is given. */
  groups?: readonly EntityGroup[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  /** An explicit "leave it unanswered" row, for a field that may stay empty. */
  noneLabel?: string;
  /**
   * What the create row reads as. Given both, a name matching nothing in the
   * list offers to become a new record instead of a dead end.
   */
  createLabel?: (typed: string) => string;
  onCreate?: (typed: string) => void;
  onChange: (value: string | null) => void;
}

const NONE = '__none__';
const CREATE = '__create__';

/**
 * A select you can type into, and add to.
 *
 * The lists it fronts grow with the temple — parties, activities, funds — so
 * the options filter as you type. The part that matters is what happens when
 * nothing matches: rather than a dead end, the typed name is offered as a new
 * record. A clerk halfway through a receipt for a donor nobody has registered
 * finishes the receipt; they do not abandon it to go and register somebody.
 */
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

  // Groups that filter down to nothing drop out entirely, so a heading never
  // sits alone over an empty stretch of list.
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

  /*
   * Offering to create a name that already names a record would be two ways to
   * say the same thing, and the existing one is always the better answer.
   */
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
    // `modal` is what makes the list scrollable inside a dialog. The dialog's
    // scroll lock only exempts its own content, and this popover is portalled
    // out to <body>, so every wheel event over it would otherwise be cancelled.
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
        {/* Filtered above so a name matching nobody still leaves the create
            row to click, which cmdk's own filter would hide along with
            everything else. */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />

          {/* The cap is what the popover can actually use, so a long list
              grows to fill a tall screen instead of stopping at nine rows. */}
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
