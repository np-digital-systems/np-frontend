"use client";

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, ChartTooltip } from '../components';
import { MONTHLY_DATA } from '../constants/mock-data';

export function AccountantIncomeChart() {
  const [range, setRange] = useState<'This Month' | 'Last Month' | 'This Year'>('This Month');

  const thisMonth = [
    { day: '01', income: 18000, expenses: 8500 },
    { day: '03', income: 5000, expenses: 0 },
    { day: '05', income: 22000, expenses: 12000 },
    { day: '07', income: 8500, expenses: 4200 },
    { day: '09', income: 35000, expenses: 15000 },
    { day: '11', income: 12500, expenses: 8200 },
    { day: '12', income: 25000, expenses: 18500 },
  ];

  const lastMonth = [
    { day: '01', income: 15000, expenses: 6000 },
    { day: '05', income: 28000, expenses: 18000 },
    { day: '10', income: 12000, expenses: 5200 },
    { day: '15', income: 42000, expenses: 21000 },
    { day: '20', income: 18500, expenses: 9800 },
    { day: '25', income: 31000, expenses: 14200 },
    { day: '31', income: 22000, expenses: 11500 },
  ];

  const data =
    range === 'Last Month'
      ? lastMonth
      : range === 'This Year'
      ? MONTHLY_DATA.map((d) => ({
          day: d.month,
          income: d.income,
          expenses: d.expenses,
        }))
      : thisMonth;

  return (
    <Card>
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Income vs Expenses
        </h3>
        <div
          className="flex items-center rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {(['This Month', 'Last Month', 'This Year'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: range === r ? 'var(--accent)' : 'transparent',
                color: range === r ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="day"
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
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#incomeGrad)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="var(--danger)"
              strokeWidth={2}
              fill="url(#expGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
