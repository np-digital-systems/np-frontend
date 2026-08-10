import React from 'react';
import { Calendar, CheckSquare, ArrowUpRight, Users, FileText } from 'lucide-react';

export function AdminQuickActions() {
  const actions = [
    { icon: Calendar, label: 'Create Event' },
    { icon: CheckSquare, label: 'View Approvals' },
    { icon: ArrowUpRight, label: 'View Transactions' },
    { icon: Users, label: 'Create User' },
    { icon: FileText, label: 'Generate Report' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {actions.map((a) => (
        <button
          key={a.label}
          className="flex items-center gap-2 rounded-lg px-3 text-xs font-medium"
          style={{
            height: 32,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background-color 120ms ease, color 120ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }}
        >
          <a.icon size={13} />
          {a.label}
        </button>
      ))}
    </div>
  );
}
