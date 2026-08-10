import React from 'react';
import {
  ChevronRight,
  Receipt,
  CreditCard,
  CheckSquare,
  Check,
  X,
} from 'lucide-react';
import { DashboardHeader } from './dashboard-header';
import { CashierWorkflow } from './cashier-workflow';
import { CashierCash } from './cashier-cash';
import { Card, CardHeader, KpiCard, LinkButton, Badge } from '../components';
import { CASHIER_SUBMISSIONS, CASHIER_ACTIVITY } from '../constants/mock-data';

export function CashierDashboard() {
  const iconMap: Record<string, any> = {
    Check: Check,
    CheckSquare: CheckSquare,
    X: X,
  };

  return (
    <div>
      <DashboardHeader name="R. Murugan" role="Cashier" />

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard label="Today's Receipts" value="₹35,000" trend="+₹35,000" positive />
        <KpiCard label="Today's Payments" value="₹12,500" />
        <KpiCard label="Pending Approval" value="5" sub="My entries" emphasis />
        <KpiCard label="Approved Today" value="8" trend="+3 from yesterday" positive />
      </div>

      {/* Primary actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <button
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white"
          style={{
            height: 48,
            padding: '0 28px',
            backgroundColor: 'var(--accent)',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '-0.01em',
          }}
        >
          <Receipt size={17} />
          New Receipt
        </button>
        <button
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl text-sm font-semibold"
          style={{
            height: 48,
            padding: '0 28px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <CreditCard size={17} />
          New Payment Voucher
        </button>
      </div>

      {/* Workflow + Cash */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
        <div className="lg:col-span-2">
          <CashierWorkflow />
        </div>
        <div className="lg:col-span-3 flex flex-col gap-5">
          <CashierCash />

          {/* Recent activity */}
          <Card>
            <CardHeader title="My Recent Activity" />
            <div>
              {CASHIER_ACTIVITY.map((item, i) => {
                // Determine icon based on text
                const isApproved = item.action.includes('approved');
                const isRejected = item.action.includes('rejected');
                const Icon = isApproved ? CheckSquare : isRejected ? X : Check;

                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-5 py-3"
                    style={{
                      borderBottom: i < CASHIER_ACTIVITY.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{ width: 28, height: 28, backgroundColor: item.color + '1a' }}
                    >
                      <Icon size={13} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {item.action}
                      </span>
                      <span className="ml-2 text-xs font-mono" style={{ color: 'var(--accent)' }}>
                        {item.ref}
                      </span>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {item.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Submissions table */}
      <Card>
        <CardHeader
          title="My Recent Submissions"
          action={
            <LinkButton>
              View all <ChevronRight size={12} />
            </LinkButton>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Reference', 'Type', 'Amount', 'Date', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left"
                    style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CASHIER_SUBMISSIONS.map((row, i) => (
                <tr
                  key={row.ref}
                  style={{
                    borderBottom: i < CASHIER_SUBMISSIONS.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <td
                    className="px-4 py-3 text-xs font-mono font-medium"
                    style={{ color: 'var(--accent)' }}
                  >
                    {row.ref}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs rounded-full px-2 py-0.5 font-medium"
                      style={{
                        backgroundColor:
                          row.type === 'Receipt' ? 'var(--success-subtle)' : 'var(--danger-subtle)',
                        color: row.type === 'Receipt' ? 'var(--success)' : 'var(--danger)',
                      }}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium tabular" style={{ color: 'var(--text-primary)' }}>
                    {row.amount}
                  </td>
                  <td className="px-4 py-3 text-xs tabular" style={{ color: 'var(--text-muted)' }}>
                    {row.date}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
