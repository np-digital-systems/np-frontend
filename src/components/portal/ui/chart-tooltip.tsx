'use client';

import { formatCurrency } from '../lib/dashboard-data';

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: readonly TooltipEntry[];
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1.5 text-[11px] font-medium text-text-muted">{label}</p>

      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden
            />
            <span className="text-text-secondary">{entry.name}</span>
            <span className="ml-auto font-semibold text-text-primary tabular">
              {formatCurrency(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
