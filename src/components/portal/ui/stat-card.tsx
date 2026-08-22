import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Card } from './card';

interface StatCardProps {
  label: string;
  value: string;
    caption?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down';
        isPositive: boolean;
  };
}

export function StatCard({ label, value, caption, trend }: StatCardProps) {
  const TrendIcon = trend?.direction === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="px-5 py-4">
      <p className="text-[13px] font-medium text-text-muted">{label}</p>

      <p className="mt-2 text-2xl font-semibold leading-none tracking-[-0.02em] text-text-primary tabular">
        {value}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {caption && (
          <span className="text-xs text-text-muted">{caption}</span>
        )}

        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium tabular',
              trend.isPositive ? 'text-success' : 'text-danger',
            )}
          >
            <TrendIcon className="size-3" aria-hidden />
            {trend.value}
          </span>
        )}
      </div>
    </Card>
  );
}
