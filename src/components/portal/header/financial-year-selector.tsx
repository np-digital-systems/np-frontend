'use client'

import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

const financialYears = [
  {
    year: '2026',
    status: 'Open',
  },
  {
    year: '2025',
    status: 'Closed',
  },
  {
    year: '2024',
    status: 'Closed',
  },
] as const

type FinancialYear = (typeof financialYears)[number]

export function FinancialYearSelector() {
  const [open, setOpen] = useState(false)

  const [selected, setSelected] =
    useState<FinancialYear>(financialYears[0])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="
          flex h-9 items-center gap-2
          rounded-lg
          px-2.5
          text-sm
          transition-colors
          hover:bg-muted
        "
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="hidden text-xs text-muted-foreground sm:block">
          FY
        </span>

        <span className="tabular font-medium text-foreground">
          {selected.year}
        </span>

        <span
          className={cn(
            'hidden rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:inline',
            selected.status === 'Open'
              ? 'bg-success-subtle text-success'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {selected.status}
        </span>

        <ChevronDown
          className={cn(
            'size-3.5 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="
            absolute right-0 top-full z-50 mt-2
            w-44
            overflow-hidden
            rounded-xl
            border
            border-border
            bg-popover
            p-1
            shadow-lg
          "
        >
          {financialYears.map(item => {
            const isSelected =
              selected.year === item.year

            return (
              <button
                key={item.year}
                type="button"
                role="menuitem"
                onClick={() => {
                  setSelected(item)
                  setOpen(false)
                }}
                className="
                  flex w-full items-center
                  justify-between
                  rounded-lg
                  px-3 py-2
                  text-sm
                  transition-colors
                  hover:bg-muted
                "
              >
                <div className="flex items-center gap-2">
                  <span className="tabular">
                    FY {item.year}
                  </span>

                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px]',
                      item.status === 'Open'
                        ? 'bg-success-subtle text-success'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {item.status}
                  </span>
                </div>

                {isSelected && (
                  <Check className="size-4 text-primary" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}