import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, LinkButton, Badge } from '../components';
import { TXN_DATA } from '../constants/mock-data';

export function AccountantTransactions() {
  return (
    <Card>
      <CardHeader
        title="Recent Transactions"
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
              {['Date', 'Reference', 'Description', 'Fund', 'Project', 'Debit', 'Credit', 'Status'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left"
                    style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {TXN_DATA.map((row, i) => (
              <tr
                key={row.ref}
                style={{
                  borderBottom: i < TXN_DATA.length - 1 ? '1px solid var(--border)' : 'none',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <td
                  className="px-4 py-3 text-xs tabular whitespace-nowrap"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {row.date}
                </td>
                <td
                  className="px-4 py-3 text-xs font-mono font-medium whitespace-nowrap"
                  style={{ color: 'var(--accent)' }}
                >
                  {row.ref}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)', minWidth: 140 }}>
                  {row.desc}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {row.fund}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {row.project}
                </td>
                <td
                  className="px-4 py-3 text-sm tabular text-right whitespace-nowrap"
                  style={{ color: row.debit ? 'var(--danger)' : 'var(--text-muted)' }}
                >
                  {row.debit || '—'}
                </td>
                <td
                  className="px-4 py-3 text-sm tabular text-right whitespace-nowrap"
                  style={{ color: row.credit ? 'var(--success)' : 'var(--text-muted)' }}
                >
                  {row.credit || '—'}
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
  );
}
