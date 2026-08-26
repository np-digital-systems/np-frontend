'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  FileText,
  Receipt,
  Search,
  User,
  Users,
  Wallet,
  PiggyBank,
  CalendarRange,
  Clock3,
  X
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'

import {
  groupResults,
  QUICK_ACTIONS,
  RECENT_SEARCHES,
  RECENTLY_VIEWED,
  TYPE_FILTERS,
  BADGE_TONE,
  type SearchResult,
  type SearchType,
} from './constants/search-shapes'
import { searchPortal } from './lib/search-actions'

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
  onNavigate?: (page: string) => void
}

const TYPE_ICONS: Partial<Record<SearchType, LucideIcon>> = {
  User,
  Event: CalendarDays,
  Receipt,
  Payment: CreditCard,
  Transaction: Wallet,
  Report: FileText,

  Sanththa: Users,
  'Fixed Deposit': PiggyBank,
  'Financial Year': CalendarRange,
  Fund: Wallet,

  // Add more only when you actually want a
  // specific icon for that search type.
}

function SearchResultIcon({
  type,
}: {
  type: SearchType
}) {
  const Icon = TYPE_ICONS[type] ?? Search

  return (
    <span
      className="
        flex size-8 shrink-0 items-center justify-center
        rounded-lg bg-muted text-muted-foreground
      "
    >
      <Icon className="size-4" />
    </span>
  )
}
const BADGE_TONE_CLASS = {
  neutral: 'bg-neutral-subtle text-text-muted',
  info: 'bg-info-subtle text-info',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
} as const

function SearchBadge({
  label,
}: {
  label: string
}) {
  const tone = BADGE_TONE[label] ?? 'neutral'

  return (
    <Badge
      variant="secondary"
      className={cn(
        'border-0 px-1.5 py-0 text-[11px] font-medium',
        BADGE_TONE_CLASS[tone],
      )}
    >
      {label}
    </Badge>
  )
}

export default function GlobalSearch({
  open,
  onClose,
  onNavigate,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<SearchType | 'All'>('All')

  const [results, setResults] = useState<readonly SearchResult[]>([])

  /*
   * Searching happens on the server, where the session's permissions decide
   * what each source may return — a cashier looking up a member gets the
   * register row and not the user record.
   */
  const term = query.trim()
  const isSearching = term.length >= 2

  useEffect(() => {
    if (!isSearching) return

    let live = true

    // Debounced: a search is a round trip, and one per keystroke would be
    // several in flight for a word nobody has finished typing.
    const timer = setTimeout(() => {
      void searchPortal(term).then((found) => {
        if (live) setResults(found)
      })
    }, 200)

    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [term, isSearching])

  const groups = useMemo(() => {
    // Below two characters there is nothing to show, whatever arrived last.
    if (!isSearching) return []

    return groupResults(
      typeFilter === 'All'
        ? results
        : results.filter((result) => result.type === typeFilter),
    )
  }, [results, typeFilter, isSearching])

  const handleNavigate = (page: string) => {
    onNavigate?.(page)
    onClose()
  }

  const handleRecentSearch = (value: string) => {
    setQuery(value)
  }

  // Reset where the close happens rather than in an effect watching `open`:
  // a setState inside an effect body triggers a second render pass for no
  // reason, and the state is only ever stale at this one moment.
  const handleOpenChange = (value: boolean) => {
    if (value) return

    setQuery('')
    setTypeFilter('All')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      {/* The palette floats above the page, so it takes the elevated popover
          surface. On `bg-background` it was pure black on a dimmed black
          page and the panel edge disappeared. */}
      <DialogContent
        className={cn(
          'top-[12%] translate-y-0 gap-0 overflow-hidden p-0',
          'border border-border bg-popover shadow-2xl',
          'sm:max-w-[640px]',
        )}
      >
        <DialogTitle className="sr-only">
          Global Search
        </DialogTitle>

        <Command shouldFilter={false} className="rounded-xl bg-transparent">
          {/* Search input */}
          <div className="relative border-b border-border">
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search users, events, receipts, payments..."
              className="h-14 border-0 pr-12 text-sm shadow-none focus:ring-0"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="
                  absolute
                  right-3
                  top-1/2
                  flex
                  size-7
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-md
                  text-muted-foreground
                  transition-colors
                  hover:bg-muted
                  hover:text-foreground
                "
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          {query && (
            <div className="flex gap-1.5 overflow-x-auto border-b border-border px-3 py-2">
              {TYPE_FILTERS.map((type) => {
                const active = typeFilter === type

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTypeFilter(type)}
                    className={`
                      shrink-0
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-medium
                      transition-colors
                      ${
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }
                    `}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          )}

          <CommandList className="max-h-[520px] px-2 py-2">
            {/* Search results */}
            {query && (
              <>
                <CommandEmpty className="py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                      <Search className="size-5 text-muted-foreground" />
                    </div>

                    <p className="text-sm font-medium">
                      No results found
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Try a different search term.
                    </p>
                  </div>
                </CommandEmpty>

                {groups.map((group) => (
                  <CommandGroup
                    key={group.type}
                    heading={`${group.type}s · ${group.items.length}`}
                  >
                    {group.items.map((result) => (
                      <SearchResultItem
                        key={result.id}
                        result={result}
                        onSelect={() => handleNavigate(result.page)}
                      />
                    ))}
                  </CommandGroup>
                ))}
              </>
            )}

            {/* Default state */}
            {!query && (
              <>
                <CommandGroup heading="Recent searches">
                  {RECENT_SEARCHES.map((item) => (
                    <CommandItem
                      key={item}
                      value={item}
                      onSelect={() => handleRecentSearch(item)}
                      className="gap-3 rounded-lg px-3 py-2.5"
                    >
                      <Clock3 className="size-4 text-muted-foreground" />

                      <span className="truncate text-sm">
                        {item}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator className="my-2" />

                <CommandGroup heading="Recently viewed">
                  {RECENTLY_VIEWED.map((item) => (
                    <CommandItem
                      key={item.label}
                      value={item.label}
                      onSelect={() => handleNavigate(item.page)}
                      className="gap-3 rounded-lg px-3 py-2.5"
                    >
                      <SearchResultIcon type={item.type} />

                      <span className="flex-1 truncate text-sm">
                        {item.label}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {item.type}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator className="my-2" />

                <CommandGroup heading="Quick actions">
                  <div className="grid grid-cols-2 gap-2 px-2">
                    {QUICK_ACTIONS.map((action) => (
                      <CommandItem
                        key={action.label}
                        value={action.label}
                        onSelect={() => handleNavigate(action.page)}
                        className="
                          h-10
                          rounded-lg
                          border
                          border-border
                          bg-card
                          px-3
                          text-sm
                          transition-colors
                          hover:bg-accent
                        "
                      >
                        <ArrowRight className="size-3.5 text-primary" />

                        <span className="truncate">
                          {action.label}
                        </span>
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>
              </>
            )}
          </CommandList>

          {/* Footer */}
          <div
            className="
              flex
              items-center
              gap-4
              border-t
              border-border
              bg-muted/30
              px-4
              py-2
              text-xs
              text-muted-foreground
            "
          >
            <Shortcut keys={['↑', '↓']} label="Navigate" />
            <Shortcut keys={['↵']} label="Open" />
            <Shortcut keys={['Esc']} label="Close" />

            <span className="ml-auto tabular">
              {query && results.length > 0
                ? `${results.length} result${results.length !== 1 ? 's' : ''}`
                : ''}
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function SearchResultItem({
  result,
  onSelect,
}: {
  result: SearchResult
  onSelect: () => void
}) {
  return (
    <CommandItem
      value={`${result.title} ${result.ref ?? ''} ${result.subtitle}`}
      onSelect={onSelect}
      className="
        group
        gap-3
        rounded-lg
        px-3
        py-2.5
      "
    >
      <SearchResultIcon type={result.type} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {result.title}
          </span>

          {result.ref && (
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {result.ref}
            </span>
          )}

          {result.badge && (
            <SearchBadge label={result.badge} />
          )}
        </div>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {result.subtitle}
          {result.meta ? ` · ${result.meta}` : ''}
        </p>
      </div>

      <ArrowRight
        className="
          size-4
          shrink-0
          text-muted-foreground
          opacity-0
          transition-opacity
          group-data-[selected=true]:opacity-100
        "
      />
    </CommandItem>
  )
}

function Shortcut({
  keys,
  label,
}: {
  keys: string[]
  label: string
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex items-center gap-0.5">
        {keys.map((key) => (
          <kbd
            key={key}
            className="
              inline-flex
              h-5
              min-w-5
              items-center
              justify-center
              rounded
              border
              border-border
              bg-background
              px-1
              font-mono
              text-[10px]
              font-medium
            "
          >
            {key}
          </kbd>
        ))}
      </span>

      {label}
    </span>
  )
}