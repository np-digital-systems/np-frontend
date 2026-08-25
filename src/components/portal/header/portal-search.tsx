'use client'

import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import GlobalSearch from '@/features/search'

import { Button } from '@/components/ui/button'

export function PortalSearch() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleShortcut)

    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  return (
    <>
      {/* Desktop: a field-shaped affordance, because that is what it opens. */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-56 justify-start gap-2 rounded-lg bg-surface-2 px-3 text-[13px] font-normal text-muted-foreground sm:flex"
      >
        <Search className="size-4 shrink-0" />

        <span className="flex-1 text-left">Search</span>

        <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-block">
          ⌘K
        </kbd>
      </Button>

      {/* Mobile */}
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="rounded-lg sm:hidden"
      >
        <Search className="size-[17px]" />
      </Button>

      <GlobalSearch open={open} onClose={() => setOpen(false)} />
    </>
  )
}
