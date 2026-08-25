'use client';

import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCompact, formatCurrency } from '@/lib/format';

import { Card, CardHeader } from './card';
import { ChartTooltip } from './chart-tooltip';
import { SegmentedControl } from './segmented-control';
import type { PeriodPoint } from './types';

interface PeriodChartProps<T extends string> {
  title: string;
  variant: 'bar' | 'area';
  periods: readonly T[];
    dataByPeriod: Record<T, readonly PeriodPoint[]>;
    summary?: readonly { label: string; value: number; color: string }[];
    height?: number;
}

/* Series render at their final size immediately. A grow-in animation on a
   financial chart delays the only thing the reader came for, and replays on
   every period switch. */
const AXIS_TICK = {
  fontSize: 11,
  fill: 'var(--text-muted)',
} as const;

export function PeriodChart<T extends string>({
  title,
  variant,
  periods,
  dataByPeriod,
  summary,
  height = 300,
}: PeriodChartProps<T>) {
  const [period, setPeriod] = useState<T>(periods[0]);

  const data = dataByPeriod[period];

  return (
    <Card>
      <CardHeader
        title={title}
        action={
          <SegmentedControl
            options={periods}
            value={period}
            onChange={setPeriod}
            label={`${title} period`}
          />
        }
      />

      <div className="p-5">
        {summary && (
          <dl className="mb-5 flex flex-wrap gap-x-8 gap-y-3">
            {summary.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
                <div>
                  <dt className="text-xs text-text-muted">{item.label}</dt>
                  <dd className="text-[13px] font-semibold text-text-primary tabular">
                    {formatCurrency(item.value)}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        )}

        <ResponsiveContainer width="100%" height={height}>
        {variant === 'bar' ? (
          <BarChart data={[...data]} barGap={4} barCategoryGap="32%">
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--chart-grid)"
            />
            <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={formatCompact}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: 'var(--interactive-hover)', radius: 4 }}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="var(--chart-5)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        ) : (
          <AreaChart data={[...data]}>
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expensesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.16} />
                <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--chart-grid)"
            />
            <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={formatCompact}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#incomeFill)"
              dot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="var(--chart-5)"
              strokeWidth={2}
              fill="url(#expensesFill)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
