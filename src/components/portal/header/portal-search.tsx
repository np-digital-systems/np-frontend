'use client'

import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import GlobalSearch from '@/features/search'

export function PortalSearch() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener(
      'keydown',
      handleShortcut,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleShortcut,
      )
    }
  }, [])

  return (
    <>
      {/* Desktop */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          hidden
          h-9
          w-56
          items-center
          gap-2
          rounded-lg
          border
          border-border
          bg-muted/60
          px-3
          text-sm
          text-muted-foreground
          transition-colors
          hover:bg-muted
          sm:flex
        "
      >
        <Search className="size-4 shrink-0" />

        <span className="flex-1 text-left">
          Search
        </span>

        <kbd
          className="
            hidden
            rounded-md
            border
            border-border
            bg-background
            px-1.5
            py-0.5
            font-mono
            text-[10px]
            text-muted-foreground
            md:inline-block
          "
        >
          ⌘K
        </kbd>
      </button>

      {/* Mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="
          flex size-9 items-center justify-center
          rounded-lg
          text-muted-foreground
          transition-colors
          hover:bg-muted
          hover:text-foreground
          sm:hidden
        "
      >
        <Search className="size-[17px]" />
      </button>

      <GlobalSearch
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}