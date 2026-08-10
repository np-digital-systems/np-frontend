"use client";

import React, { useState } from 'react';
import { Role } from './types';
import { AdminDashboard, AccountantDashboard, CashierDashboard } from './sections';

export function DashboardFeature() {
  const [role, setRole] = useState<Role>('Admin');

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Role switcher (demo UI) */}
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-xl"
        style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <span className="text-xs font-medium mr-1" style={{ color: 'var(--text-muted)' }}>
          Viewing as:
        </span>
        {(['Admin', 'Accountant', 'Cashier'] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              backgroundColor: role === r ? 'var(--surface)' : 'transparent',
              color: role === r ? 'var(--text-primary)' : 'var(--text-muted)',
              border: role === r ? '1px solid var(--border)' : '1px solid transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: role === r ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {role === 'Admin' && <AdminDashboard />}
        {role === 'Accountant' && <AccountantDashboard />}
        {role === 'Cashier' && <CashierDashboard />}
      </div>
    </div>
  );
}
