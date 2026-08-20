'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface FinancialYearOption {
  readonly year: string
  readonly status: 'Open' | 'Closed'
}

const FINANCIAL_YEARS: readonly FinancialYearOption[] = [
  { year: '2026', status: 'Open' },
  { year: '2025', status: 'Closed' },
  { year: '2024', status: 'Closed' },
]

function statusClass(status: FinancialYearOption['status']) {
  return status === 'Open'
    ? 'bg-success-subtle text-success'
    : 'bg-neutral-subtle text-text-muted'
}

/**
 * Which financial year the whole portal is reading.
 *
 * A radio group, not a list of buttons — exactly one year is active at a
 * time, and the menu should say so to assistive tech as well as visually.
 */
export function FinancialYearSelector() {
  const [year, setYear] = useState(FINANCIAL_YEARS[0].year)

  const selected =
    FINANCIAL_YEARS.find((item) => item.year === year) ?? FINANCIAL_YEARS[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-9 gap-2 rounded-lg px-2.5"
          aria-label={`Financial year ${selected.year}, ${selected.status}`}
        >
          <span className="hidden text-[11px] text-muted-foreground sm:block">
            FY
          </span>

          <span className="text-[13px] font-medium tabular">
            {selected.year}
          </span>

          <span
            className={cn(
              'hidden rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:inline',
              statusClass(selected.status),
            )}
          >
            {selected.status}
          </span>

          <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-aria-expanded/button:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-52 rounded-xl p-1.5 shadow-lg">
        <DropdownMenuLabel className="px-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          Financial Year
        </DropdownMenuLabel>

        <DropdownMenuRadioGroup value={year} onValueChange={setYear}>
          {FINANCIAL_YEARS.map((item) => (
            <DropdownMenuRadioItem
              key={item.year}
              value={item.year}
              className="h-8 text-[13px]"
            >
              <span className="tabular">FY {item.year}</span>

              <span
                className={cn(
                  'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                  statusClass(item.status),
                )}
              >
                {item.status}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
