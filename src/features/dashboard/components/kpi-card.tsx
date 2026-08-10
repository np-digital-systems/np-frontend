import React from 'react';
import { Card } from './card';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: string;
  positive?: boolean;
  emphasis?: boolean;
}

export function KpiCard({
  label,
  value,
  sub,
  trend,
  positive,
  emphasis,
}: KpiCardProps) {
  return (
    <Card style={{ padding: '16px 20px' }}>
      <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p
        className="tabular font-semibold leading-none"
        style={{
          fontSize: emphasis ? 24 : 20,
          color: emphasis ? 'var(--accent)' : 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
          {sub}
        </p>
      )}
      {trend && (
        <span
          className="inline-flex items-center gap-0.5 text-xs font-medium mt-1.5"
          style={{ color: positive ? 'var(--success)' : 'var(--danger)' }}
        >
          {positive ? <ArrowUpRight size={11} /> : <ArrowDownLeft size={11} />}
          {trend}
        </span>
      )}
    </Card>
  );
}
