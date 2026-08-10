"use client";

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, ChartTooltip } from '../components';
import { MONTHLY_DATA, QUARTERLY_DATA, YEARLY_DATA } from '../constants/mock-data';

export function AdminFinancialChart() {
  const [period, setPeriod] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const data =
    period === 'Monthly'
      ? MONTHLY_DATA
      : period === 'Quarterly'
      ? QUARTERLY_DATA
      : YEARLY_DATA;

  return (
    <Card>
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Financial Overview
        </h3>
        <div
          className="flex items-center rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {(['Monthly', 'Quarterly', 'Yearly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: period === p ? 'var(--accent)' : 'transparent',
                color: period === p ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background-color 120ms ease',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-5 mb-4">
          {[
            { label: 'Total Income', value: '₹24,65,000', color: 'var(--accent)' },
            { label: 'Total Expenses', value: '₹14,44,000', color: 'var(--danger)' },
            { label: 'Net Balance', value: '₹10,21,000', color: 'var(--success)' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="rounded-full shrink-0"
                style={{ width: 8, height: 8, backgroundColor: item.color }}
              />
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {item.label}
                </p>
                <p className="text-sm font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: 'var(--surface-2)', radius: 4 }}
            />
            <Bar dataKey="income" name="Income" fill="var(--accent)" radius={[4, 4, 0, 0]} opacity={0.85} />
            <Bar dataKey="expenses" name="Expenses" fill="var(--danger)" radius={[4, 4, 0, 0]} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
