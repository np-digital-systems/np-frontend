'use client'

import { ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { selectFinancialYear } from '@/lib/financial-year-actions'
import type { FinancialYearOption } from '@/lib/financial-year'
import {
  FINANCIAL_YEAR_STATUS_LABELS as STATUS_LABELS,
  financialYearStatusClass as statusClass,
} from '@/lib/financial-year-display'
import { cn } from '@/lib/utils'

interface FinancialYearSelectorProps {
  years: readonly FinancialYearOption[]
  active: FinancialYearOption | null
}

/**
 * Which financial year the whole portal is reading.
 *
 * A radio group, not a list of buttons — exactly one year is active at a time,
 * and the menu should say so to assistive tech as well as visually.
 *
 * The choice is written to a cookie by a server action rather than held in
 * local state, because it decides what every other screen fetches. Until that
 * landed this menu kept its own `useState` over three hardcoded years, so it
 * moved and nothing else did.
 */
export function FinancialYearSelector({
  years,
  active,
}: FinancialYearSelectorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // No years yet — a fresh database, or an API that could not be reached.
  // A menu offering nothing is worse than no menu.
  if (!active) return null

  const choose = (value: string) => {
    const id = Number(value)

    if (id === active.id) return

    startTransition(async () => {
      await selectFinancialYear(id)
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          className="h-9 gap-2 rounded-lg px-2.5"
          aria-label={`Financial year ${active.label}, ${STATUS_LABELS[active.status]}`}
        >
          <span className="hidden text-[11px] text-muted-foreground sm:block">
            FY
          </span>

          <span className="text-[13px] font-medium tabular">{active.label}</span>

          <span
            className={cn(
              'hidden rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:inline',
              statusClass(active.status),
            )}
          >
            {STATUS_LABELS[active.status]}
          </span>

          <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-aria-expanded/button:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-xl p-1.5 shadow-lg">
        <DropdownMenuLabel className="px-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          Financial Year
        </DropdownMenuLabel>

        <DropdownMenuRadioGroup value={String(active.id)} onValueChange={choose}>
          {years.map((year) => (
            <DropdownMenuRadioItem
              key={year.id}
              value={String(year.id)}
              className="h-8 text-[13px]"
            >
              <span className="tabular">FY {year.label}</span>

              <span
                className={cn(
                  'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                  statusClass(year.status),
                )}
              >
                {STATUS_LABELS[year.status]}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
